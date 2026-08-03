# Major Choice Dashboard

Static, single-page dashboard for Major Choice with three switchable views: **Homeschool Funnel**, **New Top Funnel**, and **Path To Potential**. It reads published Google Sheet CSV feeds in the browser, parses them with PapaParse, and renders KPI tiles, trend charts, live date-filtered funnels, and supporting tables/breakdowns per view. Switching views happens client-side with no reload; the shared date-range control at the top applies to whichever view is active.

## Views

- **Homeschool Funnel** — the original dashboard: KPI tiles, spend/leads trend chart, live funnel, quiz outcome breakdown, current pipeline table, and email sequence performance table. Reads `DAILY`, `FUNNEL`, `LEAD_STATUSES`, `EMAIL_SEQUENCE`, `META`.
- **New Top Funnel** — a newer, lower-volume funnel. KPI tiles (Spend, Page Views, Submissions, Cost per Submission, CTR, CPC) recomputed from range totals, a spend/submissions trend chart, a landing-page-views-to-submissions funnel, and a Result A/B/C/D outcome breakdown. Reads `NEWTOP_DAILY`. Email performance is not repeated here — it reuses the email table shown on the Homeschool Funnel view.
- **Path To Potential** — placeholder view shown until ads and Stripe checkout go live for this offer.

## Data feeds

All feeds are published Google Sheet CSVs, fetched in parallel with per-feed failure isolation (a failed feed only disables the sections that depend on it):

- `DAILY`, `FUNNEL`, `LEAD_STATUSES`, `EMAIL_SEQUENCE`, `META` — Homeschool Funnel view
- `NEWTOP_DAILY` — New Top Funnel view (`date`, `spend`, `impressions`, `clicks`, `cpc`, `ctr`, `lp_visits`, `quiz_starts`, `submissions`, `cpl`, `out_a`, `out_b`, `out_c`, `out_d`; `quiz_starts` is not displayed since this form doesn't store partials)

No browser storage is used; the dashboard is stateless between page loads.

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

No Vercel or backend is needed. The dashboard refreshes its numbers automatically because it reads the published CSV URLs directly; when the Google Sheets republish and the Apps Scripts update daily, the next page load uses the latest available data.
