# Rebuild brief: Major Choice — five-view dashboard

The dashboard in this folder already has THREE views (Homeschool Funnel, New Top Funnel,
Path To Potential) implemented via toggle buttons. ADD two more views — **Webinar** and
**Retargeting** — for a total of five. Keep the existing views and all current behavior exactly
as they are. Match the existing visual style. Do not start a preview server.

## Final tab order (left to right)
Homeschool Funnel · New Top Funnel · Webinar · Retargeting · Path To Potential

Default view on load stays **Homeschool Funnel**. One view visible at a time. The shared
date-range control at the top applies to whichever view is active.

## New feeds to add (published CSVs)
Keep all existing feed URLs. ADD these three:
```
RETARGETING_DAILY: https://docs.google.com/spreadsheets/d/e/2PACX-1vR-m-Ed1Zx5Jbhw_kTiD18bXr9j3--qBFtCYov9v_GONPAUegV4SUjuhCY-bBpdE-fBLClHrBPbW2Uf/pub?gid=932244774&single=true&output=csv
WEBINAR_DAILY:     https://docs.google.com/spreadsheets/d/e/2PACX-1vR-m-Ed1Zx5Jbhw_kTiD18bXr9j3--qBFtCYov9v_GONPAUegV4SUjuhCY-bBpdE-fBLClHrBPbW2Uf/pub?gid=1744456021&single=true&output=csv
WEBINAR_EMAILS:    https://docs.google.com/spreadsheets/d/e/2PACX-1vR-m-Ed1Zx5Jbhw_kTiD18bXr9j3--qBFtCYov9v_GONPAUegV4SUjuhCY-bBpdE-fBLClHrBPbW2Uf/pub?gid=702679207&single=true&output=csv
```
Fetch all feeds in parallel via PapaParse (`header: true`, `dynamicTyping: true`), with per-feed
failure isolation — a failed feed only blanks its own section.

## View: Webinar

Reads WEBINAR_DAILY (date-filtered) and WEBINAR_EMAILS (snapshot).

**WEBINAR_DAILY columns:** `date`, `spend`, `impressions`, `clicks`, `cpc`, `ctr`, `lp_visits`,
`reg_11am`, `reg_6pm`, `reg_total`.

**IMPORTANT framing — put a clear note box at the top of this view:**
"This webinar view has known limits. The three campaign emails below were sent to a broad
audience as invitations, not only to registrants — so email recipients and registrations are
separate groups, not funnel steps. Registrations are counted only from the two time-slot lists,
so the real total may be higher. Live attendance is not shown (it lives in the webinar platform),
and registrants who continue flow into the Homeschool quiz."

Sections:
- KPI tiles (recompute from RANGE TOTALS, em dash on divide-by-zero): Spend (sum spend),
  Page Views (sum lp_visits), Registrations (sum reg_total), 11 AM Registrations (sum reg_11am),
  6 PM Registrations (sum reg_6pm), CPC (sum spend / sum clicks), CTR (sum clicks / sum impressions * 100).
- Trend chart from filtered rows: spend per day (bars) + total registrations per day (line), dual axis.
- A small "Registrations by time slot" panel: two numbers, 11 AM (sum reg_11am) vs 6 PM (sum reg_6pm),
  over the selected range.
- Email section titled "Webinar invitation campaigns" with eyebrow "Live from Klaviyo · sent to the
  broader list, not only registrants". Full-width table from WEBINAR_EMAILS, columns: Email, Sent,
  Recipients, Delivery, Bounce, Spam, Unsub, Open. These rate columns are ALREADY real percentages —
  render as-stored with `%`, never multiply/scale. No horizontal scroll.

## View: Retargeting

Reads RETARGETING_DAILY (date-filtered). This is an ads-only funnel — the retargeting Unbounce page
just links into the Homeschool quiz, so there's no downstream metric here.

**RETARGETING_DAILY columns:** `date`, `spend`, `impressions`, `clicks`, `cpc`, `ctr`, `lp_visits`.

- Note at top: "Retargeting sends video-testimonial ads to prior visitors; the landing page links
  straight into the Homeschool quiz, so conversions appear on the Homeschool Funnel view."
- KPI tiles (range totals, em dash on divide-by-zero): Spend, Page Views (sum lp_visits),
  Clicks (sum clicks), CPC (sum spend / sum clicks), CTR (sum clicks / sum impressions * 100).
- Trend chart from filtered rows: spend per day (bars) + clicks per day (line), dual axis.

## Carry-over requirements (do not regress these)
- Existing Homeschool Funnel, New Top Funnel, and Path To Potential views stay exactly as they are,
  including the email Click column on the Homeschool view.
- All email rate columns are already real percentages — never multiply/scale.
- KPI ratios recompute from range totals, never averaged.
- The loading overlay MUST hide once rendering completes, in every case including partial failures.
- No browser storage.

## Deliverables
Edit index.html, styles.css, app.js in place. Update README to list all five views and the new feeds.
