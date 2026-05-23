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

## 4. Run Mobile Camera App (Expo)

Open a new terminal and run:

```powershell
cd mobile-camera
npm install
npx expo start
```

### Steps to Stream Live Phone Video to CCTV Page:
1. Make sure your phone and PC are connected to the **same WiFi network**.
2. Download and install the **Expo Go** app on your phone (Google Play Store for Android or iOS App Store).
3. Scan the QR code displayed in your terminal using the Expo Go app.
4. Once the app loads on your phone, configure the PC's local IP address in the settings field (e.g. `http://192.168.1.XX:8000`).
5. Click **START LIVE BROADCAST** to stream live frames to OppSync's web CCTV page as **CAM 05 // MOBILE SECURITY** with live worker detection metadata!

---

# Notes

- Make sure Python virtual environment (`venv`) is already created inside the `backend` folder.
- Ensure Node.js and npm are installed.
- Keep all terminals running simultaneously.
- Backend runs on port `8000`.
- Frontend apps will show their local URLs in the terminal after starting.
