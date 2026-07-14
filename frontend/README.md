# Dynamic Pricing Engine — Frontend

Local development steps

1. Copy `.env.example` to `.env` (do NOT commit `.env`).

2. If you have a Firebase Web app and want real Google sign-in, populate the
   `VITE_FIREBASE_*` variables with values from Firebase Project Settings → Web
   app, and enable Google under Authentication → Sign-in method. Add
   `localhost`/`localhost:5174` to Authorized domains.

3. For quick local development without Firebase, you can use the dev fake auth
   by leaving Firebase env values empty and setting `VITE_FAKE_AUTH=true` in
   your local `.env` (this is for development only).

Run the app

```bash
npm ci
npm run dev
# visit http://localhost:5173 or the port shown by Vite
```

Troubleshooting

- If you see `Firebase: Error (auth/invalid-api-key)`, your Firebase keys are
  incorrect; copy them again from Project Settings.
- If Google popup is blocked, allow popups for `localhost` in your browser.

If you want, paste your Firebase values here and I can create a local `.env`
for you (I won't commit it).