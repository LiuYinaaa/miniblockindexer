# Frontend (Vite + React)

Lightweight demo UI for querying the indexer API.

## Start

1. Start backend API on `http://localhost:3000`
2. Install frontend deps and run dev server:

```bash
cd frontend
pnpm install
pnpm dev
```

Default URL: `http://localhost:5173`

## API Base

- Default: `/api` (proxied to `http://localhost:3000` via Vite)
- Optional override:

```bash
VITE_API_BASE_URL=http://localhost:3000 pnpm dev
```
