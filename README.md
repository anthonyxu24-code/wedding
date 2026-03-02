# Cindy & Anthony · Wedding

Wedding invitation site with RSVP and registry. Built with Next.js 14, Supabase, and Stripe.

## Push to GitHub (do this first)

1. **Install Git** if needed: [git-scm.com](https://git-scm.com/)

2. **Create a new repo on GitHub**  
   Go to [github.com/new](https://github.com/new), name it e.g. `wedding`, leave it empty (no README).

3. **In this folder, run:**

   ```bash
   cd "c:\Users\Admin\Documents\Wedding"

   git init
   git add .
   git commit -m "Initial commit: wedding site with RSVP and registry"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/wedding.git
   git push -u origin main
   ```

   Replace `YOUR_USERNAME` with your GitHub username (or use the repo URL GitHub shows after creating the repo).

4. **Later, to push updates:**

   ```bash
   git add .
   git commit -m "Your message"
   git push
   ```

## Run locally

1. **Create the database table:** In [Supabase](https://supabase.com) → your project → SQL Editor, run the SQL in `supabase/schema.sql`.
2. Copy `.env.example` to `.env` and add your Supabase keys and `ADMIN_PASSWORD` (see plan.md).
3. Run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Admin: [http://localhost:3000/admin](http://localhost:3000/admin).

**If PowerShell says "running scripts is disabled":**  
- Use **Command Prompt** (cmd) instead: open cmd, `cd C:\Users\Admin\Documents\Wedding`, then `npm run dev`.  
- Or double‑click **`run-dev.cmd`** in this folder to start the dev server.

## Deploy (Vercel)

1. Push the repo to GitHub (steps above).
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo.
3. Add env vars from `.env.example` in Vercel project settings.
4. Deploy. Share the live link as your invitation.

---

Setup details, env vars, and checklist: see **[plan.md](plan.md)**.
