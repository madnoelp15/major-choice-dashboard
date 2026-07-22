# Build brief: Major Choice Homeschool Funnel Dashboard

Build a single-page static dashboard. No backend, no build step, no framework bundler.
It reads published Google Sheet CSVs and renders an interactive, presentation-ready
dashboard that filters by date range. It will be hosted on GitHub Pages.

## Stack
- Plain HTML, CSS, and vanilla JavaScript.
- Chart.js (from CDN) for charts.
- PapaParse (from CDN) for CSV parsing.
- No localStorage, no server, no API keys. Everything is read from the CSV URLs below.

## Files to create
- `index.html`
- `styles.css`
- `app.js`  (put the CSV URLs in a CONFIG object at the top)
- `README.md`  (how to preview locally and how to deploy to GitHub Pages)

## Data sources (published Google Sheet CSVs)
```
DAILY:          https://docs.google.com/spreadsheets/d/e/2PACX-1vR-m-Ed1Zx5Jbhw_kTiD18bXr9j3--qBFtCYov9v_GONPAUegV4SUjuhCY-bBpdE-fBLClHrBPbW2Uf/pub?gid=0&single=true&output=csv
FUNNEL:         https://docs.google.com/spreadsheets/d/e/2PACX-1vR-m-Ed1Zx5Jbhw_kTiD18bXr9j3--qBFtCYov9v_GONPAUegV4SUjuhCY-bBpdE-fBLClHrBPbW2Uf/pub?gid=205182846&single=true&output=csv
EMAIL_SEQUENCE: https://docs.google.com/spreadsheets/d/e/2PACX-1vR-m-Ed1Zx5Jbhw_kTiD18bXr9j3--qBFtCYov9v_GONPAUegV4SUjuhCY-bBpdE-fBLClHrBPbW2Uf/pub?gid=1431254621&single=true&output=csv
LEAD_STATUSES:  https://docs.google.com/spreadsheets/d/e/2PACX-1vR-m-Ed1Zx5Jbhw_kTiD18bXr9j3--qBFtCYov9v_GONPAUegV4SUjuhCY-bBpdE-fBLClHrBPbW2Uf/pub?gid=354656874&single=true&output=csv
META:           https://docs.google.com/spreadsheets/d/e/2PACX-1vR-m-Ed1Zx5Jbhw_kTiD18bXr9j3--qBFtCYov9v_GONPAUegV4SUjuhCY-bBpdE-fBLClHrBPbW2Uf/pub?gid=1305639501&single=true&output=csv
```
Fetch all five on load, in parallel. Parse with PapaParse using `header: true` and
`dynamicTyping: true`. Show a brief loading state, then render. If a feed is empty
or fails, show a small "no data yet" note for that section and keep the rest working.

## Tab schemas

### daily  (one row per day, this is the only date-driven source)
Columns: `date` (YYYY-MM-DD), `spend`, `impressions`, `clicks`, `leads`, `cpc`, `ctr`,
`cpl`, `lp_visits`, `lp_leads`, `tf_submissions`, `out_below16`, `out_neuro`,
`out_unqualified`, `out_nondiv_qual`.
Notes: `lp_visits` equals `clicks`. `leads` is the ad-platform lead count; `lp_leads`
is the actual landing-page signup count. Use `lp_leads` for the lead metrics.

### funnel  (lifetime snapshot, OPTIONAL, do not use for the main funnel)
Columns: `step`, `visitors`, `views`, `conversions`, `cvr`. This is an all-time block.
The live, date-driven funnel must be built from the `daily` tab instead (see below).
You may ignore this feed, or show it only as a small "all time" reference if convenient.

### lead_statuses  (current pipeline snapshot, not date-filtered)
Columns: `status`, `qualified`, `unqualified`, `total`. Rows are whatever ClickUp
statuses currently hold leads, so the row set is dynamic. Status names arrive lowercase;
title-case them for display.

### email_sequence  (manual snapshot, not date-filtered, may be empty for now)
Columns: `email`, `sent`, `unique_recipients`, `delivery_rate`, `bounce_rate`,
`spam_rate`, `unsub_rate`, `open_rate`. Up to 7 rows. If empty, show "updated manually,
no data yet."

### meta
Columns: `key`, `value`. Read the `last_updated` value and show it in the header.

## Date range control
A control with presets plus a custom range:
- Last 7 days
- Last 30 days
- This month
- All time  (default selected)
- Custom (two date inputs, from and to)
The selected range filters the `daily` rows by `date`. Everything in the KPI tiles, the
trend chart, and the funnel recomputes from the filtered `daily` rows. The lead_statuses
and email_sequence sections are snapshots and do not change with the date range; label
them clearly as current snapshots.

## KPI tiles (recompute from RANGE TOTALS, never average the per-day ratios)
Compute these from the sum of the filtered `daily` rows:
- Spend = sum(spend)
- Leads = sum(lp_leads)
- Submissions = sum(tf_submissions)
- Cost per lead = sum(spend) / sum(lp_leads)
- Cost per submission = sum(spend) / sum(tf_submissions)
- CTR = sum(clicks) / sum(impressions) * 100
- CPC = sum(spend) / sum(clicks)
Important: do not average the daily `cpl`, `ctr`, or `cpc` columns. Always divide the
range totals. Any divide-by-zero shows an em dash, not NaN or Infinity.

Formatting: spend, cost per lead, cost per submission, and CPC as USD with two decimals
and thousands separators. CTR as a percent with two decimals. Counts as integers with
thousands separators.

## Trend chart (from filtered daily)
A time-series across the selected range, one point per day, sorted by date:
- Spend per day (bars)
- Leads per day, using `lp_leads` (line)
Use a dual axis so spend and leads read clearly. Keep it clean and labeled.

## Funnel (built live from filtered daily, this must trend with the dates)
Sum these across the filtered `daily` rows and show as a funnel or stepped bar:
1. Landing Page Visits = sum(lp_visits)
2. Leads (signups) = sum(lp_leads)        rate vs previous = leads / visits
3. Quiz Submissions = sum(tf_submissions)  rate vs previous = submissions / leads
Then show the outcome split as its own small breakdown (cards or a bar):
- Below 16 = sum(out_below16)
- Neuro Divergent = sum(out_neuro)
- Unqualified = sum(out_unqualified)
- Non-Divergent Qualified = sum(out_nondiv_qual)
Note: the four outcomes may not sum exactly to submissions, because a few legacy quiz
endings are intentionally excluded upstream. Present outcomes as their own breakdown, do
not force them to equal the submissions number.

## Lead statuses section (snapshot)
A clean table from `lead_statuses`: Status, Qualified, Unqualified, Total. Title-case the
status names. Sort by Total descending. Add a totals row at the bottom. Optionally a
stacked bar of qualified vs unqualified per status. Label it "Current pipeline."

## Email sequence section (snapshot, manual)
A table from `email_sequence` showing the 7 emails and their rates. Label it "Email
sequence, updated manually." If the feed is empty, show the placeholder note.

## Header and styling
- Title: Major Choice, Homeschool Funnel Dashboard.
- Small line: "Data as of {meta.last_updated}".
- Mach 7 Marketing as the maker, subtle.
- Clean, light, presentation-ready. Card-based KPI tiles, generous spacing, a readable
  sans-serif, restrained color. It will be shown to a client on a screen share, so favor
  clarity over density. No heavy gradients or clutter.

## Behavior and robustness
- Default range is All time on first load.
- Recompute everything date-driven whenever the range changes.
- Handle empty or missing feeds gracefully, per section.
- No browser storage of any kind.

## README.md
Include:
- Local preview: run a tiny static server in the project folder, for example
  `python -m http.server 8000` then open `http://localhost:8000`, because opening
  `index.html` directly can block the CSV fetches in some browsers.
- Deploy: push to a GitHub repo, enable GitHub Pages on the main branch root, share the
  Pages URL. No Vercel needed. The dashboard refreshes its numbers automatically because
  the sheet republishes the CSVs, and the Apps Script updates the sheet daily.
