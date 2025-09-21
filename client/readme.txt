
---

# 📂 `client/README.md`

```markdown
# Axon Frontend (Next.js + Tailwind)

This is the **user interface** for Axon.

---

## 🌟 Features

- **Hero Landing Page** with Axon logo & animation.
- **Explore Tab** → List manuscripts open for review.
- **Submit Tab** → Upload manuscript (to IPFS + chain).
- **My Reviews** → Track review history, rewards.
- **Profile Page** → Bio, expertise, affiliations.
- **Review Mode**:
  - PDF opens in full width.
  - Right side collapsible Assistant Panel (like GitHub Copilot).
  - Assistant highlights, comments, flags in real time.

---

## 📂 File Structure

client/
├─ src/
│ ├─ app/ # Next.js routes/pages
│ │ ├─ page.tsx # Landing page
│ │ ├─ review/[id]/ # PDF review pages
│ │ └─ profile/ # User profile
│ │
│ ├─ components/ # Shared UI components
│ │ ├─ assistant/ # AssistantPanel + FloatingButton
│ │ ├─ Logo.tsx # Axon logo
│ │ └─ ui/ # Reusable buttons, cards, inputs
│ │
│ ├─ styles/ # Tailwind + globals.css
│ └─ config.ts # Backend API URL
│
├─ public/ # Static assets (icons, logo, etc.)
└─ tailwind.config.ts


---

## 🚀 Setup

### 1. Install deps
```bash
cd client
npm install

2. Run dev server
npm run dev


Open app at:
👉 http://localhost:3000

🔌 Connection to Backend

Client calls ML backend at http://localhost:8000.

Change URL in src/config.ts if needed.

🎨 UI Notes

Assistant only appears in /review/[id] pages (when reviewing a manuscript).

Dark/Light Mode supported.

Animations: minimal background waves, smooth transitions.

PDF Viewer is embedded, fills screen, assistant on right.