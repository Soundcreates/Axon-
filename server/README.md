# Axon ML Backend (FastAPI)

This is the **AI/ML backend** that powers tagging, reviewer matching, and the assistant.

---

## 📡 Endpoints

Run `uvicorn app.main:app --reload --port 8000` then open [http://localhost:8000/docs](http://localhost:8000/docs).

- `POST /tag/paper` → Extracts top-K tags from manuscript text.
- `POST /tag/reviewer` → Extracts expertise tags from reviewer profile text.
- `POST /match` → Matches paper to ranked reviewers.
- `POST /assistant` → Live assistant (summaries, strengths, weaknesses, flags).

---

## 📂 File Structure

server/
├─ app/
│ ├─ main.py # FastAPI entrypoint
│ ├─ tagging.py # Embeddings + zero-shot tagging
│ ├─ matching.py # Logic for matching reviewers
│ └─ assistant.py # LLM-powered review helper
│
├─ scripts/
│ ├─ build_dataset.py # Build dataset of papers + tags
│ ├─ train_tagger.py # Train tagging model
│ └─ eval_tagger.py # Evaluate tagging model (F1 scores)
│
├─ models/ # Trained checkpoints (e.g. SPECTER2 embeddings)
└─ requirements.txt # Python dependencies

yaml
Copy code

---

## 🛠️ Setup

### 1. Virtual env
```bash
cd server
python -m venv .venv
.venv\Scripts\activate   # Windows
2. Install deps
bash
Copy code
pip install -r requirements.txt
⚡ Workflow
Dataset prep

bash
Copy code
python scripts/build_dataset.py
→ Outputs train/test data.

Training

bash
Copy code
python scripts/train_tagger.py
→ Saves model in /models/.

Evaluation

bash
Copy code
python scripts/eval_tagger.py
→ Reports macro-F1, micro-F1.

Run API

bash
Copy code
uvicorn app.main:app --reload --port 8000