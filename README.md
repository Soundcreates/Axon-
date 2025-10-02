# TensorStack-io_Internal-Round_90
# Axon: Decentralized Peer Review Platform

This repo contains two main parts:

1. **server/** → AI + ML backend (FastAPI).
   - Paper tagging (extract domains/topics from a manuscript).
   - Reviewer tagging (derive expertise areas).
   - Matching system (connects papers to reviewers).
   - Assistant service (helps reviewers during review).

2. **client/** → Frontend (Next.js + Tailwind).
   - User interface for authors, reviewers, and readers.
   - PDF review mode with collapsible assistant.
   - Profile pages, manuscript submission, review tracking.
   - Light/Dark mode, mobile/desktop responsive.

---

## 🔗 High-Level Flow

1. **Authors** upload manuscripts → stored on IPFS (stubbed for now).
2. **Server** tags manuscript topics → saved for matching.
3. **Reviewers** are suggested based on their profile tags.
4. **Reviewer UI** loads PDF → Assistant Panel appears with highlights, summaries, flags.
5. **Blockchain Layer** (handled by you 🙂) records transactions (stake, submit, rewards).

---

## 📂 Repo Structure

axon-ui/
├─ client/ # Next.js frontend
│ ├─ src/app/ # Next.js pages
│ ├─ src/components/ # UI components (buttons, assistant, etc.)
│ ├─ public/ # Static assets (logo, icons)
│ └─ tailwind.config.ts
│
├─ server/ # FastAPI ML backend
│ ├─ app/ # FastAPI entrypoint + API routes
│ ├─ scripts/ # Training scripts (build_dataset, train_tagger, eval_tagger)
│ ├─ models/ # Saved model checkpoints
│ └─ requirements.txt
│
└─ README.md # (this file)

yaml
Copy code

---

## ⚡ Setup

- See [`server/README.md`](./server/README.md) for ML backend setup.  
- See [`client/README.md`](./client/README.md) for frontend setup.  
# Axon-
