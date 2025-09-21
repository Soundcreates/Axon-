import fitz  # PyMuPDF
import re
from typing import List, Dict

SECTION_HINTS = ["abstract", "introduction", "methods", "methodology", "experiments",
                 "results", "discussion", "conclusion", "references"]

def extract_text_from_pdf(path:str) -> str:
    doc = fitz.open(path)
    texts = []
    for p in doc:
        texts.append(p.get_text("text"))
    return "\n".join(texts)

def split_sections(txt:str) -> List[Dict]:
    # naive heuristic: split by headings (all-caps or numbered)
    lines = txt.splitlines()
    sections = []
    cur = {"name":"Body","text":""}
    for ln in lines:
        h = ln.strip()
        if re.match(r"^([A-Z][A-Z\s]{3,}|[0-9]+\.[\w\s-]{3,})$", h) or h.lower() in SECTION_HINTS:
            if cur["text"].strip():
                sections.append(cur)
            cur = {"name":h.title(), "text":""}
        else:
            cur["text"] += ln + "\n"
    if cur["text"].strip(): sections.append(cur)
    return sections[:10]  # keep short for demo

def summarize_block(text:str, max_chars:int=600) -> str:
    t = " ".join(text.split())
    return t[:max_chars] + ("..." if len(t) > max_chars else "")
