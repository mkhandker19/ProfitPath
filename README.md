# ProfitPath

Modern, sleek stock insights with **Polygon** data and **AI Q&A** (OpenAI). Built on **Next.js 14** + **Tailwind**.

## Features
- Glassmorphism UI, floating quick-lookup widget, and centered hero.
- Secure server routes for Polygon data (no keys in the browser).
- AI Q&A modal to explain stock picks or strategies.
- Clear disclaimer baked into the homepage.

## Quickstart

1) Install deps
```bash
npm install
# or
pnpm install
```

2) Create `.env` in the project root:
```
# PRIVATE: DO NOT COMMIT OR SHARE
POLYGON_API_KEY=REPLACE_WITH_YOUR_REAL_KEY
OPENAI_API_KEY=REPLACE_WITH_YOUR_REAL_KEY
```

3) Dev server
```bash
npm run dev
```

Open http://localhost:3000

## Notes
- The floating widget queries `/api/quote?symbol=AAPL` for previous day's aggregate.
- The AI modal posts to `/api/ai` which calls OpenAI's Chat Completions (model `gpt-4o-mini`). You can change the model in `app/api/ai/route.ts`.
- If you keep this ZIP only on your laptop, it's safe to keep `.env` included. If you ever share or push, remove or rotate the keys.

## Auth (Local Demo)
- Register at `/register` with:
  - Username: alphanumeric, at least 8 chars
  - Email: must end with `.com`
  - Password: at least 8 chars
  - First/Last name: letters only
- Login at `/login` with your username or email.
- A JWT cookie keeps you signed in; visit `/dashboard` to confirm.
- Users are stored in `data/users.json` (local only). Do not commit this file if you plan to share the project.
- Set `JWT_SECRET` in `.env` for stronger signing.
