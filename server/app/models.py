# from sentence_transformers import SentenceTransformer
# from transformers import pipeline

# # Load once at boot
# emb_model = SentenceTransformer("intfloat/e5-base-v2")
# # zero-shot for tags (can swap to smaller if needed)
# zshot = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

# # label space (start small; expand later)
# PAPER_LABELS = [
#     "DeSci", "peer review", "blockchain", "tokenomics",
#     "machine learning", "NLP", "computer vision",
#     "chemistry", "biology", "cryptography", "systems"
# ]
from sentence_transformers import SentenceTransformer
from transformers import pipeline
import torch

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

emb_model = SentenceTransformer("intfloat/e5-base-v2", device=DEVICE)

# Run zero-shot on GPU too (it will pick CUDA automatically if available)
zshot = pipeline(
    "zero-shot-classification",
    model="facebook/bart-large-mnli",
    device=0 if DEVICE == "cuda" else -1
)
