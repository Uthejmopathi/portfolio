# Uthej Mopathi — Portfolio

Please find my portfolio website here detailing my experience, projects and contributions.

## Live site (GitHub Pages)

**https://uthejmopathi.github.io/portfolio/**

Hosted from the `main` branch (static files at repo root). Every push to `main` republishes the site.

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
