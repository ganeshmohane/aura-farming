# Aura Farming

Simple Aura Farming web app using **Next.js + shadcn-style UI + MySQL**.

## Features

- Register users with name + email
- Give positive/negative aura events
- Live leaderboard showing all users and current aura
- Recent aura event feed
- Auto-creates required MySQL tables on first run

## Stack

- Next.js (App Router, TypeScript)
- Tailwind CSS (black & white theme)
- MySQL (`mysql2`) for Railway deployment

## Environment Variables

Set these in Railway (or `.env.local`):

- `DATABASE_URL` (Railway MySQL connection string)
- `MYSQL_SSL=true` (optional, if your DB requires SSL)

## Local run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.
