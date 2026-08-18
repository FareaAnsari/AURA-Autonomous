# ⚡ AURA — Autonomous Universal Research & Drafting Agent

[![Live Production](https://img.shields.io/badge/Vercel-Live--App-00D4FF?style=for-the-badge&logo=vercel)](https://aura-agent-ten.vercel.app)
[![Supabase DB](https://img.shields.io/badge/Supabase-Database-10B981?style=for-the-badge&logo=supabase)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-A855F7?style=for-the-badge)](LICENSE)

**AURA** (Autonomous Universal Research Agent) is a high-fidelity, autonomous web agent interface engineered for intelligent deep research, product comparisons, verification, and document drafting. Give AURA a goal — it plans, searches, navigates, cross-verifies data points, synthesizes findings, and drafts formal documents autonomously.

---

## 🌟 Key Features

* **🧠 Autonomous Intent & Planning Engine**: 
  Parses raw user requests to extract budget, category, location, duration, and requirements automatically.
* **✍️ Professional Document Drafting Engine**:
  Detects implicit drafting intents to create formal letters, applications, SOPs, and reports with one-click **Copy to Clipboard** and **Download .txt** capabilities.
* **📡 Interactive Source Inspection Modal**:
  Deep-dive into verified web sources with confidence scoring, live domain links, and metric breakdown.
* **🌀 Cyber Portal Animation & Particle Visuals**:
  Immersive HTML5 Canvas portal canvas with 3D parallax particle mesh, glowing energy rings, and smooth warp transitions.
* **💾 Supabase Database Persistence**:
  Persists research missions, extracted candidates, source metrics, and verification logs in real-time to Supabase SQL.
* **🛡️ Multi-Source Verification**:
  Cross-checks critical facts across multiple independent sources and flags data discrepancies.

---

## 🌐 Live Production Demo

Explore the live application deployed on Vercel:
👉 **[https://aura-agent-ten.vercel.app](https://aura-agent-ten.vercel.app)**

---

## 🛠️ Tech Stack & Architecture

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend UI** | HTML5, Vanilla CSS, JS (ES6+) | Custom glassmorphic styling, keyframe micro-animations |
| **Canvas Graphics** | HTML5 2D Canvas API | Interactive Cyber Portal particle mesh & energy rings |
| **Database** | Supabase (PostgreSQL) | Persistence for mission logs, intent metadata, candidate tables |
| **AI Inference** | OpenRouter / Groq API | Real-time LLM reasoning, research synthesis, and drafting |
| **Hosting & CI/CD** | Vercel | Production deployment with automated git integration |

---

## 📁 Repository Structure

```
aura-agent/
├── index.html            # Main compiled production Single Page Application
├── aura_app.js           # Core Agent Controller & Business Logic
├── build.py              # Single-file HTML compiler & CSS bundling script
├── supabase_schema.sql   # Supabase SQL Database migration schema
├── vercel.json           # Vercel deployment routing configuration
└── README.md             # Project documentation
```

---

## 🚀 Getting Started Locally

### Prerequisites
- Python 3.8+ (for running the build & development server)
- Modern web browser (Chrome, Edge, Firefox, Safari)

### Installation & Execution

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/FareaAnsari/AURA-Autonomous.git
   cd AURA-Autonomous
   ```

2. **Rebuild Static Bundle (Optional)**:
   ```bash
   python build.py
   ```

3. **Launch Local Dev Server**:
   ```bash
   python -m http.server 8000
   ```
   Open `http://localhost:8000` in your web browser.

---

## 🗄️ Supabase Setup

To enable real-time mission logging to your Supabase project:
1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in Supabase dashboard.
3. Run the SQL script from `supabase_schema.sql`.

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
