import faiss, numpy as np
from typing import Dict

class VecStore:
    def __init__(self, dim:int):
        self.index = faiss.IndexFlatIP(dim)
        self.items: Dict[str, dict] = {}
        self.order: list[str] = []

    def add(self, key:str, vec:np.ndarray, meta:dict):
        self.items[key] = {"vec":vec, "meta":meta}
        self.order = list(self.items.keys())  # simple

    def _matrix(self):
        if not self.items: return np.zeros((0,1),dtype="float32")
        return np.stack([v["vec"] for v in self.items.values()])

    def search(self, q:np.ndarray, k:int=5):
        X = self._matrix()
        if X.shape[0]==0:
            return np.array([[0.]]), np.array([[-1]])
        idx = faiss.IndexFlatIP(X.shape[1]); idx.add(X)
        D, I = idx.search(q[None,:], min(k, X.shape[0]))
        keys = list(self.items.keys())
        return [(keys[i], float(D[0][j])) for j,i in enumerate(I[0]) if i>=0]

PAPERS = VecStore(dim=768)
REVIEWERS = VecStore(dim=768)
