# Uthej Mopathi — Portfolio

Static sci-fi / HUD portfolio site. Hosted via **GitHub Pages + GitHub Actions**, and also easy to drop on a NAS.

## Live site (GitHub Pages)

After the first successful Actions run, the site will be at:

`https://uthejmopathi.github.io/portfolio/`

Every push to `main` redeploys automatically (see `.github/workflows/deploy-pages.yml`).

### One-time GitHub setup

1. Create a public repo named `portfolio` under your GitHub account.
2. Push this project to `main`.
3. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Open the **Actions** tab and confirm the “Deploy to GitHub Pages” workflow succeeds.

## Contents

- `index.html` — site entry
- `css/styles.css` — styles
- `js/main.js` — interactions
- `UthejMopathiResume.pdf` — downloadable resume
- `.github/workflows/deploy-pages.yml` — Pages deploy

## Local preview

Open `index.html` in a browser, or from this folder:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Host on a NAS (optional)

This is a **static** site — no Node, Docker, or database required.

1. Zip this folder (or copy the files).
2. Put them in the NAS web root (Web Station / nginx / etc.).
3. Keep `index.html`, `css/`, `js/`, and the resume PDF together.

## Updating later

Edit files locally, commit, and push to `main` — Actions republishes the site.
