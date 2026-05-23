# Project Setup & Run Guide

## 1. Run Backend Server

Open terminal in the project root folder and run:

```powershell
cd backend
& .\venv\Scripts\Activate.ps1
python manage.py runserver 0.0.0.0:8000
```

---

## 2. Run Opsync Frontend

Open a new terminal and run:

```powershell
cd frontend\Opsync
npm install
npm run dev
```

---

## 3. Run Worker App

Open another terminal and run:

```powershell
cd frontend\worker-app
npm install
npm run dev
```

---

# Notes

- Make sure Python virtual environment (`venv`) is already created inside the `backend` folder.
- Ensure Node.js and npm are installed.
- Keep all three terminals running simultaneously.
- Backend runs on port `8000`.
- Frontend apps will show their local URLs in the terminal after starting.
