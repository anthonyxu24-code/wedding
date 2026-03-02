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

```bash
npm install
cp .env.example .env
# Edit .env with your Supabase and Stripe values (see plan.md)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Admin: [http://localhost:3000/admin](http://localhost:3000/admin).

## Deploy (Vercel)

1. Push the repo to GitHub (steps above).
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo.
3. Add env vars from `.env.example` in Vercel project settings.
4. Deploy. Share the live link as your invitation.

---

Setup details, env vars, and checklist: see **[plan.md](plan.md)**.
