# Major Choice Homeschool Funnel Dashboard

Static, single-page dashboard for the Major Choice homeschool funnel. It reads published Google Sheet CSV feeds in the browser, parses them with PapaParse, and renders KPI tiles, a trend chart, a live date-filtered funnel, current lead statuses, and the manual email sequence snapshot.

## Local Preview

Run a tiny static server from this project folder:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Opening `index.html` directly can block CSV fetches in some browsers, so use the local server for the most reliable preview.

## Deploy to GitHub Pages

1. Push these files to a GitHub repository.
2. In GitHub, open the repository settings.
3. Go to **Pages**.
4. Set the source to the `main` branch and the repository root.
5. Save and share the generated GitHub Pages URL.

No Vercel or backend is needed. The dashboard refreshes its numbers automatically because it reads the published CSV URLs directly; when the Google Sheet republishes and the Apps Script updates the sheet daily, the next page load uses the latest available data.
