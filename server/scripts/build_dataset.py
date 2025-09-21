# server/scripts/build_dataset.py
import os
import json
import csv
from typing import Dict, List, Any

RAW_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "openalex_raw.jsonl")
OUT_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "papers.csv")


def reconstruct_abstract(inv_index: Dict[str, List[int]]) -> str:
    """
    OpenAlex returns abstracts as an inverted index: {word: [positions...]}.
    Reconstruct the full abstract text from that structure.
    """
    if not inv_index:
        return ""
    # find length
    max_pos = 0
    for positions in inv_index.values():
        if positions:
            max_pos = max(max_pos, max(positions))
    words = [""] * (max_pos + 1)
    for word, positions in inv_index.items():
        for p in positions:
            if 0 <= p < len(words):
                words[p] = word
    # collapse multiple spaces just in case
    return " ".join(w for w in words if w)


def yield_text(rec: Dict[str, Any]) -> str:
    """
    Build a single text field per record: title + abstract (+ optional venue).
    This is what we’ll embed and feed to the tagger.
    """
    title = rec.get("title") or rec.get("display_name") or ""
    abstract = ""

    # OpenAlex style
    if "abstract_inverted_index" in rec and isinstance(rec["abstract_inverted_index"], dict):
        abstract = reconstruct_abstract(rec["abstract_inverted_index"])
    # Sometimes we stored a plain 'abstract'
    elif isinstance(rec.get("abstract"), str):
        abstract = rec["abstract"]

    venue = ""
    if isinstance(rec.get("host_venue"), dict):
        venue = rec["host_venue"].get("display_name") or ""
    elif isinstance(rec.get("venue"), str):
        venue = rec["venue"]

    parts = [title.strip(), abstract.strip(), venue.strip()]
    return ". ".join([p for p in parts if p]).strip()


def extract_labels(rec: Dict[str, Any]) -> List[str]:
    """
    Derive multi-label tags from OpenAlex concepts/topics if present.
    Falls back to any category field we might have stored during fetch.
    """
    labels: List[str] = []

    # Prefer OpenAlex 'concepts' if available
    if isinstance(rec.get("concepts"), list):
        for c in rec["concepts"]:
            name = (c.get("display_name") or c.get("name") or "").strip().lower()
            # optionally use level (lower level = broader); keep a mix
            level = c.get("level")
            if name:
                labels.append(name)

    # Some fetchers store a 'topics' list already
    if not labels and isinstance(rec.get("topics"), list):
        for t in rec["topics"]:
            if isinstance(t, str):
                labels.append(t.strip().lower())
            elif isinstance(t, dict):
                nm = (t.get("name") or t.get("display_name") or "").strip().lower()
                if nm:
                    labels.append(nm)

    # Fallback to a single 'category' string we might have written
    if not labels and isinstance(rec.get("category"), str):
        labels.append(rec["category"].strip().lower())

    # Deduplicate, keep order
    seen = set()
    out: List[str] = []
    for lab in labels:
        if lab and lab not in seen:
            seen.add(lab)
            out.append(lab)
    return out[:12]  # cap to something reasonable


def main():
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)

    rows = 0
    all_labels = set()

    with open(RAW_PATH, "r", encoding="utf-8") as fin, open(OUT_PATH, "w", newline="", encoding="utf-8") as fout:
        writer = csv.DictWriter(fout, fieldnames=["id", "title", "text", "tags"])
        writer.writeheader()

        for line in fin:
            if not line.strip():
                continue
            rec = json.loads(line)

            rid = rec.get("id") or rec.get("doi") or rec.get("openalex_id") or f"row_{rows+1}"
            title = rec.get("title") or rec.get("display_name") or "(untitled)"
            text = yield_text(rec)
            labels = extract_labels(rec)

            for lab in labels:
                all_labels.add(lab)

            writer.writerow({
                "id": str(rid),
                "title": title,
                "text": text,
                "tags": ";".join(labels),
            })
            rows += 1

    print(f"rows={rows} labels={len(all_labels)} -> {OUT_PATH}")


if __name__ == "__main__":
    main()
