import requests, json, random, time, sys, os
from pathlib import Path

OUT = Path(__file__).resolve().parents[1]/"data"/"openalex_raw.jsonl"
OUT.parent.mkdir(parents=True, exist_ok=True)

# Broad domains mapped to OpenAlex "concepts.id" filters (Level 0/1 concepts)
DOMAINS = {
  "biology": "C41008148",
  "medicine": "C71924100",
  "chemistry": "C185592680",
  "physics": "C121332964",
  "mathematics": "C33923547",
  "computer_science": "C41008148?no",  # will use search later for spread
  "engineering": "C127313418",
  "environmental_science": "C86803240",
  "materials_science": "C138885662",
  "economics": "C162324750",
  "psychology": "C15744967",
  "social_sciences": "C17744445"
}

# We’ll query diverse recent years to avoid bias
YEARS = list(range(2016, 2025))

def works(params):
    url = "https://api.openalex.org/works"
    r = requests.get(url, params=params, timeout=30)
    r.raise_for_status()
    return r.json()

def reconstruct_abstract(ii:dict)->str:
    if not ii: return ""
    words = []
    for w, idxs in ii.items():
        for i in idxs:
            while len(words) <= i:
                words.append("")
            words[i] = w
    return " ".join([w for w in words if w])

def fetch_domain(concept_id:str, target:int=26):
    # Pull ~26 per domain → ~312 total
    got = 0
    out = []
    random.shuffle(YEARS)
    for yr in YEARS:
        params = {
          "filter": f"from_publication_date:{yr}-01-01,to_publication_date:{yr}-12-31,primary_location.source.type:journal",
          "sort": "cited_by_count:desc",
          "per_page": 25,
        }
        if concept_id != "C41008148?no":
            params["filter"] += f",concepts.id:{concept_id}"
        else:
            params["search"] = "computer science"  # widen CS
        try:
            res = works(params)
        except Exception as e:
            continue
        for it in res.get("results", []):
            abs_txt = reconstruct_abstract(it.get("abstract_inverted_index"))
            if not abs_txt: continue
            o = {
                "id": it["id"],
                "title": it.get("title",""),
                "abstract": abs_txt,
                "concepts": [c["display_name"] for c in it.get("concepts",[]) if c.get("level",2) <= 1][:8]
            }
            out.append(o); got += 1
            if got >= target: return out
        time.sleep(0.8)
    return out

def main():
    all_items=[]
    for name,cid in DOMAINS.items():
        print(f"Fetching {name}...")
        items = fetch_domain(cid, target=26)
        for x in items: x["domain"]=name
        all_items.extend(items)
    random.shuffle(all_items)
    with OUT.open("w", encoding="utf-8") as f:
        for rec in all_items:
            f.write(json.dumps(rec, ensure_ascii=False)+"\n")
    print(f"Wrote {len(all_items)} records to {OUT}")

if __name__=="__main__":
    main()
