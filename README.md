# 🎓 Vanguard AI — Career Forecaster

Vanguard AI is an AI-powered career intelligence platform that analyzes a user's resume, evaluates skill readiness, and generates a future learning roadmap.

The system combines resume parsing, skill trend analysis, and UI visualization to help users understand their career trajectory.

---

## 🚀 Features

* 📄 Resume Upload & Skill Extraction
* 🧠 AI Skill Intelligence (trend analysis)
* 📊 Skill Dashboard with readiness score
* 🎯 Future Skills recommendation
* 💬 AI Career Twin (chat interface)
* 🗺 Learning Roadmap (30 / 60 / 90 days)
* 👤 Profile & Career insights UI

---

## 🏗 Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* Framer Motion
* Axios

### Backend

* FastAPI (Python)
* Resume parsing logic
* AI analysis engine

### AI Layer

* Skill trend analysis
* Readiness scoring
* Gap analysis

---

## 📁 Project Structure

```
career_forecaster/
│
├── backend/
│   ├── main.py
│   ├── recommender.py
│   ├── uploads/
│   └── .env
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api/
│   │   └── assets/
│   └── package.json
```

---

## ⚙️ Setup Instructions

### 1️⃣ Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs on:

```
http://localhost:8000
```

---

### 2️⃣ Frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

*
