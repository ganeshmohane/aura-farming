# Aura Farming

Simple Aura Farming web app using **Next.js + shadcn-style UI + MySQL**.

## Features

- Register users with name + email
- Give positive/negative aura events
- Live leaderboard showing all users and current aura
- Recent aura event feed
- Auto-creates required MySQL tables on first run
- Plays a meme sound (`fahhh`) on landing when browser autoplay allows it

## Stack

- Next.js (App Router, TypeScript)
- Tailwind CSS (black & white theme)
- MySQL (`mysql2`) for Railway deployment

## Environment Variables

Set these in Railway (or `.env.local`):

- `DATABASE_URL` (Railway MySQL connection string)
- `MYSQL_SSL=true` (optional, if your DB requires SSL)

## Sound Setup

Place your meme sound file at:

- `public/fahhh.mp3`

On page load the app tries to autoplay this sound. If browser autoplay is blocked, a **Play fahhh** button appears.

If `public/fahhh.mp3` is missing, the app falls back to a built-in synthetic fahhh sound so the button still works.

## Local run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.
