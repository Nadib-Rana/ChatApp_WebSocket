# ChatApp Client

This is a Vite + React + TypeScript + Tailwind client for the ChatApp backend.

Quick start (from project root):

```powershell
cd client
npm install
# create a .env file with VITE_API_URL=http://localhost:5005
npm run dev
```

Notes:
- The client expects the backend API at `VITE_API_URL` (default `http://localhost:5005`).
- WebSocket connection uses the same origin (http -> ws). The app sends the JWT in the WebSocket querystring: `/?token=...`.
