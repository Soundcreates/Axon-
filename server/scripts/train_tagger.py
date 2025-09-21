import pandas as pd, numpy as np, joblib, collections
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.linear_model import LogisticRegression
from sklearn.multiclass import OneVsRestClassifier
from sentence_transformers import SentenceTransformer
from pathlib import Path

DATA = Path(__file__).resolve().parents[1]/"data"/"papers.csv"
OUT  = Path(__file__).resolve().parents[1]/"models"/"tagger_lr.joblib"
OUT.parent.mkdir(parents=True, exist_ok=True)

# --- load
df = pd.read_csv(DATA)
df["tags_list"] = df["tags"].apply(lambda s: [t.strip() for t in s.split(";") if t.strip()])

# --- prune rare labels
cnt = collections.Counter([t for row in df["tags_list"] for t in row])
MIN_SUPPORT = 3  # try 3 first; if still too many labels, use 5
kept = set([t for t,c in cnt.items() if c >= MIN_SUPPORT])
df["tags_list"] = df["tags_list"].apply(lambda row: [t for t in row if t in kept])
df = df[df["tags_list"].map(len) > 0].reset_index(drop=True)

labels = sorted(kept)
mlb = MultiLabelBinarizer(classes=labels)
Y = mlb.fit_transform(df["tags_list"])

# --- embed (SPECTER2)
emb = SentenceTransformer("allenai/specter2_base", device="cuda" if __import__("torch").cuda.is_available() else "cpu")
X = emb.encode(df["text"].tolist(), normalize_embeddings=True).astype("float32")

# --- train (class-balanced)
clf = OneVsRestClassifier(LogisticRegression(max_iter=400, class_weight="balanced", n_jobs=8))
clf.fit(X, Y)

joblib.dump({"clf": clf, "mlb": mlb, "labels": labels}, OUT)
print(f"Saved {OUT} | labels_kept={len(labels)} | samples={len(df)} | min_support={MIN_SUPPORT}")
