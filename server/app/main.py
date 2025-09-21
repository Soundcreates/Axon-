from fastapi import FastAPI, UploadFile, File
from .schemas import PaperTagReq, ReviewerTagReq, MatchReq, AssistantReq
from .parser import extract_text_from_pdf, split_sections, summarize_block
from .tagging import embed, learned_tags
from .vectorstore import PAPERS, REVIEWERS
import os, tempfile
from fastapi import Response
from fastapi.responses import StreamingResponse
import json, time
app = FastAPI(title="Axon ML API", version="0.1")

# --- Helpers ---
def text_from_req(cid:str|None, text:str|None)->str:
    # For hackathon: accept text. If CID provided, fetch via IPFS gateway later.
    if text: return text
    return "Stub text (CID fetch not implemented in MVP)"

# --- Endpoints ---

@app.post("/tag/paper")
def tag_paper(req: PaperTagReq):
    txt = text_from_req(req.cid, req.text)
    vec = embed([txt])[0]
    tags = learned_tags(txt)   # uses trained model; falls back if missing
    pid = f"p_{len(PAPERS.items)+1}"
    PAPERS.add(pid, vec, {"tags":tags})
    return {"tags": tags, "topics": tags[:3], "embedding_id": pid}

@app.post("/tag/reviewer")
def tag_reviewer(req: ReviewerTagReq):
    bundle = " \n".join([
        req.profile_text,
        *req.past_titles,
        *req.past_abstracts,
        req.notes
    ]).strip()
    vec = embed([bundle])[0]
    tags = learned_tags(bundle, topk=6)
    rid = f"r_{len(REVIEWERS.items)+1}"
    REVIEWERS.add(rid, vec, {"wallet": req.wallet, "tags": tags, "rep": 70})
    return {"tags": tags, "embedding_id": rid}


@app.post("/match")
def match(req: MatchReq):
    p = PAPERS.items[req.paper_embedding_id]
    qv = p["vec"]
    hits = REVIEWERS.search(qv, k=req.k)
    out = []
    for key, cos in hits:
        r = REVIEWERS.items[key]["meta"]
        r_tags = set(r["tags"]); p_tags = set(req.paper_tags)
        jacc = len(r_tags & p_tags) / max(1, len(r_tags | p_tags))
        score = 0.45*cos + 0.35*jacc + 0.15*(r["rep"]/100)
        out.append({"wallet": r["wallet"], "score": round(score,3), "tags": r["tags"], "reputation": r["rep"]})
    return sorted(out, key=lambda x:x["score"], reverse=True)

@app.post("/assistant")
def assistant(req: AssistantReq):
    txt = text_from_req(req.cid, req.text)
    # naive sectioning + extractive summaries
    secs = split_sections(txt)
    out_sections = [{"name": s["name"], "summary": summarize_block(s["text"])} for s in secs[:6]]
    # red flags: very simple heuristics Aryy stylel hehe
    red = []
    if "ablation" not in txt.lower(): red.append("No ablation study mentioned")
    if "code" not in txt.lower() and "repository" not in txt.lower(): red.append("No code/reproducibility link")
    if "baseline" not in txt.lower(): red.append("Baselines not clearly stated")
    # QA (RAG-lite): cosine top chunks (we’ll just echo a stub)
    answers = [{"q": q, "a": "See Methods/Results; (MVP stub)"} for q in (req.questions or [])]
    return {"sections": out_sections, "red_flags": red, "answers": answers}
@app.post("/assistant/stream")
def assistant_stream(req: AssistantReq):
    txt = text_from_req(req.cid, req.text)

    def gen():
        # step 1: structure
        yield f"data: {json.dumps({'kind':'status','msg':'Parsing and chunking'})}\n\n"
        secs = split_sections(txt)
        time.sleep(0.1)

        # step 2: quick summaries
        for s in secs[:6]:
            payload = {'kind':'section', 'name': s['name'], 'summary': summarize_block(s['text'])}
            yield f"data: {json.dumps(payload)}\n\n"
            time.sleep(0.05)

        # step 3: heuristics (produce highlight stubs)
        red = []
        if "ablation" not in txt.lower():
            red.append({"issue":"No ablation study mentioned","page":1,"excerpt":"...","severity":"medium"})
        if "baseline" not in txt.lower():
            red.append({"issue":"Baselines not clearly stated","page":2,"excerpt":"..."})
        yield f"data: {json.dumps({'kind':'red_flags','items':red})}\n\n"

        # step 4: answer questions
        for q in (req.questions or []):
            yield f"data: {json.dumps({'kind':'answer','q':q,'a':'(MVP) See Methods/Results'})}\n\n"

        # done
        yield "data: {\"kind\":\"done\"}\n\n"

    return StreamingResponse(gen(), media_type="text/event-stream")