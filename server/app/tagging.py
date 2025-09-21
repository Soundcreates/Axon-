import os, numpy as np, joblib
from .models import emb_model, zshot
LABEL_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "label_space.txt")

CANDIDATE_LABELS = []
if os.path.exists(LABEL_PATH):
    with open(LABEL_PATH, "r", encoding="utf-8") as f:
        CANDIDATE_LABELS = [ln.strip() for ln in f if ln.strip()]

TAGGER = None
TAGGER_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "tagger_lr.joblib")
if os.path.exists(TAGGER_PATH):
    TAGGER = joblib.load(TAGGER_PATH)

def embed(texts):
    X = emb_model.encode(texts, normalize_embeddings=True)
    return X.astype("float32")

LEXICON = {
    "deep learning": ["transformer", "cnn", "rnn", "attention", "diffusion"],
    "NLP": ["language model", "bert", "gpt", "tokenization", "nlp"],
    "computer vision": ["image", "segmentation", "detection", "vision"],
    "bioinformatics": ["genome", "protein", "sequence", "rna", "omics"],
    "chemistry": ["molecule", "chemical", "synthesis", "reaction"],
    "blockchain": ["smart contract", "ethereum", "on-chain", "token"],
    "cryptography": ["encryption", "zero-knowledge", "zk", "signature"],
    "reproducibility": ["code available", "reproducibility", "open data"],
}

def lexicon_boost(text: str):
    t = text.lower()
    bumps = {}
    for label, keys in LEXICON.items():
        if any(k in t for k in keys):
            bumps[label] = bumps.get(label, 0.0) + 0.25
    return bumps

def learned_tags(text: str, topk: int = 5):
    # classifier (if available)
    clf_scores = {}
    if TAGGER is not None:
        proba = TAGGER["clf"].predict_proba(embed([text]))[0]
        labels = TAGGER["mlb"].classes_
        for i, p in enumerate(proba):
            clf_scores[labels[i]] = float(p)

    # zero-shot over curated labels
    z = zshot(text, CANDIDATE_LABELS or list(clf_scores.keys()), multi_label=True)
    zscores = dict(zip(z["labels"], z["scores"]))

    # lexicon hints
    bumps = lexicon_boost(text)

    # combine (weighted)
    combined = {}
    all_keys = set(clf_scores) | set(zscores) | set(bumps)
    for k in all_keys:
        combined[k] = 0.6*clf_scores.get(k, 0.0) + 0.35*zscores.get(k, 0.0) + 0.05*bumps.get(k, 0.0)

    # return top-k nonzero
    ranked = sorted(combined.items(), key=lambda x: x[1], reverse=True)
    return [k for k, v in ranked[:topk] if v > 0]
