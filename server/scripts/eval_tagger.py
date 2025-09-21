import pandas as pd, numpy as np, collections
from pathlib import Path
from sentence_transformers import SentenceTransformer
from sklearn.metrics import f1_score
from sklearn.linear_model import LogisticRegression
from sklearn.multiclass import OneVsRestClassifier
from sklearn.preprocessing import MultiLabelBinarizer
from iterstrat.ml_stratifiers import MultilabelStratifiedShuffleSplit

DATA = Path(__file__).resolve().parents[1]/"data"/"papers.csv"

df = pd.read_csv(DATA)
df["tags_list"] = df["tags"].apply(lambda s: [t.strip() for t in s.split(";") if t.strip()])

# prune rare
cnt = collections.Counter([t for row in df["tags_list"] for t in row])
kept = {t for t,c in cnt.items() if c >= 3}
df["tags_list"] = df["tags_list"].apply(lambda row: [t for t in row if t in kept])
df = df[df["tags_list"].map(len)>0].reset_index(drop=True)

texts = df["text"].tolist()
labels_list = df["tags_list"].tolist()
mlb = MultiLabelBinarizer()
Y = mlb.fit_transform(labels_list)

msss = MultilabelStratifiedShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
(train_idx, test_idx), = msss.split(np.zeros(len(texts)), Y)

texts_train = [texts[i] for i in train_idx]
texts_test  = [texts[i] for i in test_idx]
Y_train, Y_test = Y[train_idx], Y[test_idx]

emb = SentenceTransformer("allenai/specter2_base", device="cuda" if __import__("torch").cuda.is_available() else "cpu")
X_train = emb.encode(texts_train, normalize_embeddings=True)
X_test  = emb.encode(texts_test,  normalize_embeddings=True)

clf = OneVsRestClassifier(LogisticRegression(max_iter=400, class_weight="balanced", n_jobs=8))
clf.fit(X_train, Y_train)

# Thresholded
proba = clf.predict_proba(X_test)
pred_thr = (proba >= 0.30).astype(int)

# Top-K (choose best K per sample)
K = 4
topk_idx = np.argsort(-proba, axis=1)[:, :K]
pred_topk = np.zeros_like(proba, dtype=int)
for i,row in enumerate(topk_idx):
    pred_topk[i, row] = 1

print("THRESHOLD macro-F1 :", f1_score(Y_test, pred_thr, average="macro", zero_division=0))
print("THRESHOLD micro-F1 :", f1_score(Y_test, pred_thr, average="micro", zero_division=0))
print("TOP-K     macro-F1 :", f1_score(Y_test, pred_topk, average="macro", zero_division=0))
print("TOP-K     micro-F1 :", f1_score(Y_test, pred_topk, average="micro", zero_division=0))
