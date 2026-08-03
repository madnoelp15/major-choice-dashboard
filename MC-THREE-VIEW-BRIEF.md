# Rebuild brief: Major Choice — three-view dashboard

Restructure the existing dashboard in this folder (index.html, styles.css, app.js) into ONE
page with three switchable views. Keep the current visual style, palette, and all existing
behavior of the current dashboard. Do not start a preview server.

## The three views

Add a row of three toggle buttons near the top, under the title: **Homeschool Funnel**,
**New Top Funnel**, **Path To Potential**. Exactly one view is visible at a time. Switching is
done in the browser with no reload (show/hide sections, toggle the existing active class used by
the date-preset buttons). Default view on load: **Homeschool Funnel**.

The date-range control stays shared at the top and applies to whichever view is active.

### View 1 — Homeschool Funnel (this is the CURRENT dashboard, unchanged)
Everything the dashboard already renders today: KPI tiles, the spend/leads trend chart, the
live funnel, the quiz outcomes (Below 16 / Neuro Divergent / Unqualified / Non-Divergent
Qualified), the Current pipeline table, and the Email sequence performance table (with the
Click column). Reads DAILY, FUNNEL (if used), LEAD_STATUSES, EMAIL_SEQUENCE, META. Do not change
its logic or layout — just wrap it as the "Homeschool Funnel" view.

### View 2 — New Top Funnel (new)
Reads the new NEWTOP_DAILY feed. This funnel is newer and lower-volume. Build it in the same
visual language as the Homeschool view:

**NEWTOP_DAILY columns:** `date`, `spend`, `impressions`, `clicks`, `cpc`, `ctr`, `lp_visits`,
`quiz_starts`, `submissions`, `cpl`, `out_a`, `out_b`, `out_c`, `out_d`.

- **Do NOT display `quiz_starts`** — this form doesn't store partials, so it just duplicates
  `submissions` and would imply 100% completion.
- KPI tiles (recompute from RANGE TOTALS, never average per-day ratios): Spend, Page Views
  (sum lp_visits), Submissions (sum submissions), Cost per Submission (sum spend / sum
  submissions), CTR (sum clicks / sum impressions * 100), CPC (sum spend / sum clicks). Any
  divide-by-zero shows an em dash.
- Trend chart from the filtered rows: spend per day (bars) + submissions per day (line), dual axis.
- Funnel (built live from filtered rows, trends with dates): Landing Page Views (sum lp_visits)
  → Quiz Submissions (sum submissions), with the conversion rate submissions / lp_visits.
- Outcome breakdown (four cards or a bar chart) from summed out_a..out_d over the range, labeled:
  - "Result A (Path to Potential)"  = sum(out_a)
  - "Result B (Path to Potential)"  = sum(out_b)
  - "Result C (Homeschool Quiz)"    = sum(out_c)
  - "Result D (Homeschool Quiz)"    = sum(out_d)
- A short note under the outcomes: "Results A & B route to the Path to Potential offer; Results
  C & D route into the Homeschool quiz."
- Do NOT repeat the email table here — the New Top Funnel uses the same New Email Sequence -
  Homeschool flow already shown on the Homeschool Funnel view. Optionally add a one-line note
  saying so.

### View 3 — Path To Potential (placeholder)
No ads and no Stripe yet. Show a single explanatory card, same card styling as the rest:
"Path to Potential launches later. Ad performance and Stripe checkout revenue will be added once
it goes live." Do not fabricate numbers.

## Data sources (published CSVs)
Keep the existing Homeschool feed URLs already in app.js. ADD this one:
```
NEWTOP_DAILY: https://docs.google.com/spreadsheets/d/e/2PACX-1vR-m-Ed1Zx5Jbhw_kTiD18bXr9j3--qBFtCYov9v_GONPAUegV4SUjuhCY-bBpdE-fBLClHrBPbW2Uf/pub?gid=386066102&single=true&output=csv
```
Fetch it in parallel with the others via PapaParse (`header: true`, `dynamicTyping: true`), with
per-section failure isolation — if NEWTOP_DAILY fails, the other views still work.

## Carry-over requirements (do not regress these)
- Email rate columns are ALREADY real percentages — render as-stored with `%`, never multiply/scale.
- KPI ratios recompute from range totals, never averaged.
- The loading overlay MUST hide once rendering completes, in every case including partial failures.
  (If the current dashboard has the lingering-spinner bug, fix it while you're here.)
- No browser storage.

## Deliverables
Edit index.html, styles.css, app.js in place. Update README to note the three views and the new feed.
