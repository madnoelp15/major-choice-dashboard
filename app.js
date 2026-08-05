const CONFIG = {
  DAILY: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR-m-Ed1Zx5Jbhw_kTiD18bXr9j3--qBFtCYov9v_GONPAUegV4SUjuhCY-bBpdE-fBLClHrBPbW2Uf/pub?gid=0&single=true&output=csv",
  FUNNEL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR-m-Ed1Zx5Jbhw_kTiD18bXr9j3--qBFtCYov9v_GONPAUegV4SUjuhCY-bBpdE-fBLClHrBPbW2Uf/pub?gid=205182846&single=true&output=csv",
  EMAIL_SEQUENCE: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR-m-Ed1Zx5Jbhw_kTiD18bXr9j3--qBFtCYov9v_GONPAUegV4SUjuhCY-bBpdE-fBLClHrBPbW2Uf/pub?gid=1431254621&single=true&output=csv",
  LEAD_STATUSES: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR-m-Ed1Zx5Jbhw_kTiD18bXr9j3--qBFtCYov9v_GONPAUegV4SUjuhCY-bBpdE-fBLClHrBPbW2Uf/pub?gid=354656874&single=true&output=csv",
  META: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR-m-Ed1Zx5Jbhw_kTiD18bXr9j3--qBFtCYov9v_GONPAUegV4SUjuhCY-bBpdE-fBLClHrBPbW2Uf/pub?gid=1305639501&single=true&output=csv",
  NEWTOP_DAILY: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR-m-Ed1Zx5Jbhw_kTiD18bXr9j3--qBFtCYov9v_GONPAUegV4SUjuhCY-bBpdE-fBLClHrBPbW2Uf/pub?gid=386066102&single=true&output=csv",
  RETARGETING_DAILY: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR-m-Ed1Zx5Jbhw_kTiD18bXr9j3--qBFtCYov9v_GONPAUegV4SUjuhCY-bBpdE-fBLClHrBPbW2Uf/pub?gid=932244774&single=true&output=csv",
  WEBINAR_DAILY: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR-m-Ed1Zx5Jbhw_kTiD18bXr9j3--qBFtCYov9v_GONPAUegV4SUjuhCY-bBpdE-fBLClHrBPbW2Uf/pub?gid=1744456021&single=true&output=csv",
  WEBINAR_EMAILS: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR-m-Ed1Zx5Jbhw_kTiD18bXr9j3--qBFtCYov9v_GONPAUegV4SUjuhCY-bBpdE-fBLClHrBPbW2Uf/pub?gid=702679207&single=true&output=csv"
};

const state = {
  daily: [],
  leadStatuses: [],
  emailSequence: [],
  meta: [],
  newTopDaily: [],
  retargetingDaily: [],
  webinarDaily: [],
  webinarEmails: [],
  failedFeeds: [],
  selectedRange: "all",
  customFrom: "",
  customTo: "",
  activeView: "homeschool",
  trendChart: null,
  newTopChart: null,
  webinarChart: null,
  retargetingChart: null
};

const els = {
  loading: document.querySelector("#loadingState"),
  errorBanner: document.querySelector("#errorBanner"),
  lastUpdated: document.querySelector("#lastUpdated"),
  viewButtons: document.querySelectorAll(".view-button"),
  views: {
    homeschool: document.querySelector("#view-homeschool"),
    newtop: document.querySelector("#view-newtop"),
    webinar: document.querySelector("#view-webinar"),
    retargeting: document.querySelector("#view-retargeting"),
    path: document.querySelector("#view-path")
  },
  kpiGrid: document.querySelector("#kpiGrid"),
  rangeSummary: document.querySelector("#rangeSummary"),
  rangeButtons: document.querySelectorAll(".range-button"),
  customRange: document.querySelector("#customRange"),
  fromDate: document.querySelector("#fromDate"),
  toDate: document.querySelector("#toDate"),
  trendEmpty: document.querySelector("#trendEmpty"),
  funnelEmpty: document.querySelector("#funnelEmpty"),
  funnelSteps: document.querySelector("#funnelSteps"),
  outcomeGrid: document.querySelector("#outcomeGrid"),
  statusEmpty: document.querySelector("#statusEmpty"),
  statusTable: document.querySelector("#statusTable"),
  emailEmpty: document.querySelector("#emailEmpty"),
  emailTable: document.querySelector("#emailTable"),
  newTopRangeSummary: document.querySelector("#newTopRangeSummary"),
  newTopKpiGrid: document.querySelector("#newTopKpiGrid"),
  newTopTrendEmpty: document.querySelector("#newTopTrendEmpty"),
  newTopFunnelEmpty: document.querySelector("#newTopFunnelEmpty"),
  newTopFunnelSteps: document.querySelector("#newTopFunnelSteps"),
  newTopOutcomeGrid: document.querySelector("#newTopOutcomeGrid"),
  webinarRangeSummary: document.querySelector("#webinarRangeSummary"),
  webinarKpiGrid: document.querySelector("#webinarKpiGrid"),
  webinarTrendEmpty: document.querySelector("#webinarTrendEmpty"),
  webinarTimeSlotEmpty: document.querySelector("#webinarTimeSlotEmpty"),
  webinarTimeSlot: document.querySelector("#webinarTimeSlot"),
  webinarEmailEmpty: document.querySelector("#webinarEmailEmpty"),
  webinarEmailTable: document.querySelector("#webinarEmailTable"),
  retargetingRangeSummary: document.querySelector("#retargetingRangeSummary"),
  retargetingKpiGrid: document.querySelector("#retargetingKpiGrid"),
  retargetingTrendEmpty: document.querySelector("#retargetingTrendEmpty")
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  bindControls();

  if (!window.Papa || !window.Chart) {
    showGlobalNotice("Required charting or CSV libraries did not load. Check the CDN connection and refresh.");
    els.loading.hidden = true;
    return;
  }

  try {
    const results = await Promise.all(
      Object.entries(CONFIG).map(([name, url]) => loadCsv(name, url))
    );

    for (const result of results) {
      if (!result.ok) {
        state.failedFeeds.push(result.name.toLowerCase().replaceAll("_", " "));
        continue;
      }
      if (result.name === "DAILY") state.daily = normalizeDaily(result.rows);
      if (result.name === "LEAD_STATUSES") state.leadStatuses = result.rows.filter(hasAnyValue);
      if (result.name === "EMAIL_SEQUENCE") state.emailSequence = result.rows.filter(hasAnyValue);
      if (result.name === "META") state.meta = result.rows.filter(hasAnyValue);
      if (result.name === "NEWTOP_DAILY") state.newTopDaily = normalizeNewTop(result.rows);
      if (result.name === "RETARGETING_DAILY") state.retargetingDaily = normalizeRetargeting(result.rows);
      if (result.name === "WEBINAR_DAILY") state.webinarDaily = normalizeWebinarDaily(result.rows);
      if (result.name === "WEBINAR_EMAILS") state.webinarEmails = result.rows.filter(hasAnyValue);
    }

    setupDateInputs();
    renderStaticSections();
    renderDateDrivenSections();

    if (state.failedFeeds.length) {
      showGlobalNotice(`Some feeds could not be loaded: ${state.failedFeeds.join(", ")}. Available sections are still shown.`);
    }
  } catch (error) {
    showGlobalNotice("Dashboard data finished loading, but a rendering error occurred. Some sections may be unavailable.");
  } finally {
    els.loading.hidden = true;
  }
}

function loadCsv(name, url) {
  return new Promise((resolve) => {
    Papa.parse(url, {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve({
          ok: !results.errors.length,
          name,
          rows: Array.isArray(results.data) ? results.data : [],
          errors: results.errors
        });
      },
      error: (error) => resolve({ ok: false, name, rows: [], error })
    });
  });
}

function bindControls() {
  els.rangeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedRange = button.dataset.range;
      els.rangeButtons.forEach((item) => item.classList.toggle("is-active", item === button));
      updateDateInputsForPreset();
      renderDateDrivenSections();
    });
  });

  els.fromDate.addEventListener("change", () => {
    state.customFrom = els.fromDate.value;
    renderDateDrivenSections();
  });

  els.toDate.addEventListener("change", () => {
    state.customTo = els.toDate.value;
    renderDateDrivenSections();
  });

  els.viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.activeView = button.dataset.view;
      els.viewButtons.forEach((item) => item.classList.toggle("is-active", item === button));
      Object.entries(els.views).forEach(([name, section]) => {
        section.hidden = name !== state.activeView;
      });
    });
  });
}

function setupDateInputs() {
  if (!state.daily.length) return;
  const dates = state.daily.map((row) => row.date);
  const min = dates[0];
  const max = dates[dates.length - 1];

  for (const input of [els.fromDate, els.toDate]) {
    input.min = min;
    input.max = max;
  }

  state.customFrom = min;
  state.customTo = max;
  updateDateInputsForPreset();
}

// Mirrors the preset math in filterRowsByRange so the From/To fields show the
// same start/end dates that are actually driving the filtered results.
function updateDateInputsForPreset() {
  if (state.selectedRange === "custom") {
    els.fromDate.disabled = false;
    els.toDate.disabled = false;
    return;
  }

  els.fromDate.disabled = true;
  els.toDate.disabled = true;

  if (!state.daily.length) return;
  const dates = state.daily.map((row) => row.date);
  const minDate = dates[0];
  const maxDate = dates[dates.length - 1];
  let from = minDate;
  let to = maxDate;

  if (state.selectedRange === "7") {
    from = shiftDate(maxDate, -6);
  } else if (state.selectedRange === "30") {
    from = shiftDate(maxDate, -29);
  } else if (state.selectedRange === "month") {
    from = `${maxDate.slice(0, 8)}01`;
  }

  if (from > to) [from, to] = [to, from];
  els.fromDate.value = from;
  els.toDate.value = to;
}

function normalizeDaily(rows) {
  return rows
    .filter((row) => row.date)
    .map((row) => ({
      ...row,
      date: String(row.date).trim(),
      spend: num(row.spend),
      impressions: num(row.impressions),
      clicks: num(row.clicks),
      lp_leads: num(row.lp_leads),
      tf_submissions: num(row.tf_submissions),
      lp_visits: num(row.lp_visits),
      out_below16: num(row.out_below16),
      out_neuro: num(row.out_neuro),
      out_unqualified: num(row.out_unqualified),
      out_nondiv_qual: num(row.out_nondiv_qual)
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function normalizeNewTop(rows) {
  return rows
    .filter((row) => row.date)
    .map((row) => ({
      ...row,
      date: String(row.date).trim(),
      spend: num(row.spend),
      impressions: num(row.impressions),
      clicks: num(row.clicks),
      lp_visits: num(row.lp_visits),
      submissions: num(row.submissions),
      out_a: num(row.out_a),
      out_b: num(row.out_b),
      out_c: num(row.out_c),
      out_d: num(row.out_d)
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function normalizeRetargeting(rows) {
  return rows
    .filter((row) => row.date)
    .map((row) => ({
      ...row,
      date: String(row.date).trim(),
      spend: num(row.spend),
      impressions: num(row.impressions),
      clicks: num(row.clicks),
      lp_visits: num(row.lp_visits)
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function normalizeWebinarDaily(rows) {
  return rows
    .filter((row) => row.date)
    .map((row) => ({
      ...row,
      date: String(row.date).trim(),
      spend: num(row.spend),
      impressions: num(row.impressions),
      clicks: num(row.clicks),
      lp_visits: num(row.lp_visits),
      reg_11am: num(row.reg_11am),
      reg_6pm: num(row.reg_6pm),
      reg_total: num(row.reg_total)
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function renderStaticSections() {
  const lastUpdated = findMeta("last_updated");
  els.lastUpdated.textContent = `Data as of ${lastUpdated || "not available"}`;
  renderLeadStatuses();
  renderEmailSequence();
  renderWebinarEmails();
}

function renderDateDrivenSections() {
  const filteredRows = getFilteredDailyRows();
  const totals = sumDaily(filteredRows);

  renderRangeSummary(filteredRows);
  renderKpis(totals, state.daily.length === 0);
  renderTrend(filteredRows);
  renderFunnel(totals);
  renderOutcomes(totals);

  try {
    renderNewTopSections();
  } catch (error) {
    showGlobalNotice("New Top Funnel view failed to render. Other views are still available.");
  }

  try {
    renderWebinarSections();
  } catch (error) {
    showGlobalNotice("Webinar view failed to render. Other views are still available.");
  }

  try {
    renderRetargetingSections();
  } catch (error) {
    showGlobalNotice("Retargeting view failed to render. Other views are still available.");
  }
}

function getFilteredDailyRows() {
  return filterRowsByRange(state.daily);
}

function getFilteredNewTopRows() {
  return filterRowsByRange(state.newTopDaily);
}

function getFilteredWebinarRows() {
  return filterRowsByRange(state.webinarDaily);
}

function getFilteredRetargetingRows() {
  return filterRowsByRange(state.retargetingDaily);
}

function filterRowsByRange(rows) {
  if (!rows.length) return [];
  const dates = rows.map((row) => row.date);
  const minDate = dates[0];
  const maxDate = dates[dates.length - 1];
  let from = minDate;
  let to = maxDate;

  if (state.selectedRange === "7") {
    from = shiftDate(maxDate, -6);
  } else if (state.selectedRange === "30") {
    from = shiftDate(maxDate, -29);
  } else if (state.selectedRange === "month") {
    from = `${maxDate.slice(0, 8)}01`;
  } else if (state.selectedRange === "custom") {
    from = state.customFrom || minDate;
    to = state.customTo || maxDate;
  }

  if (from > to) [from, to] = [to, from];
  return rows.filter((row) => row.date >= from && row.date <= to);
}

function renderRangeSummary(rows) {
  if (!state.daily.length) {
    els.rangeSummary.textContent = "No daily data loaded.";
    return;
  }

  if (!rows.length) {
    els.rangeSummary.textContent = "No daily rows in the selected range.";
    return;
  }

  const first = rows[0].date;
  const last = rows[rows.length - 1].date;
  els.rangeSummary.textContent = first === last ? formatDate(first) : `${formatDate(first)} to ${formatDate(last)}`;
}

function renderKpis(totals, dailyMissing) {
  const kpis = dailyMissing ? [
    ["Spend", "&mdash;", "No daily data loaded"],
    ["Leads", "&mdash;", "No daily data loaded"],
    ["Submissions", "&mdash;", "No daily data loaded"],
    ["Cost per lead", "&mdash;", "No daily data loaded"],
    ["Cost per submission", "&mdash;", "No daily data loaded"],
    ["CTR", "&mdash;", "No daily data loaded"],
    ["CPC", "&mdash;", "No daily data loaded"]
  ] : [
    ["Spend", usd(totals.spend), "Total ad spend"],
    ["Leads", integer(totals.lp_leads), "Landing-page signups"],
    ["Submissions", integer(totals.tf_submissions), "Quiz submissions"],
    ["Cost per lead", usd(divide(totals.spend, totals.lp_leads)), "Spend / signups"],
    ["Cost per submission", usd(divide(totals.spend, totals.tf_submissions)), "Spend / submissions"],
    ["CTR", percent(divide(totals.clicks, totals.impressions) * 100), "Clicks / impressions"],
    ["CPC", usd(divide(totals.spend, totals.clicks)), "Spend / clicks"]
  ];

  els.kpiGrid.innerHTML = kpis.map(([label, value, hint]) => `
    <article class="kpi-card">
      <div class="label">${label}</div>
      <div class="value">${value}</div>
      <div class="hint">${hint}</div>
    </article>
  `).join("");
}

function renderTrend(rows) {
  const ctx = document.querySelector("#trendChart");
  const hasRows = rows.length > 0;
  els.trendEmpty.hidden = hasRows;
  ctx.hidden = !hasRows;

  if (!hasRows) {
    if (state.trendChart) state.trendChart.destroy();
    state.trendChart = null;
    return;
  }

  const chartData = {
    labels: rows.map((row) => formatShortDate(row.date)),
    datasets: [
      {
        type: "bar",
        label: "Spend",
        data: rows.map((row) => row.spend),
        backgroundColor: "rgba(34, 103, 173, 0.78)",
        borderRadius: 4,
        yAxisID: "ySpend"
      },
      {
        type: "line",
        label: "Leads",
        data: rows.map((row) => row.lp_leads),
        borderColor: "#2f8f6b",
        backgroundColor: "#2f8f6b",
        borderWidth: 3,
        pointRadius: rows.length > 45 ? 0 : 3,
        tension: 0.22,
        yAxisID: "yLeads"
      }
    ]
  };

  if (state.trendChart) {
    state.trendChart.data = chartData;
    state.trendChart.update();
    return;
  }

  state.trendChart = new Chart(ctx, {
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8 } },
        tooltip: {
          callbacks: {
            label: (context) => context.dataset.label === "Spend"
              ? `Spend: ${usd(context.parsed.y)}`
              : `Leads: ${integer(context.parsed.y)}`
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 10 } },
        ySpend: {
          beginAtZero: true,
          position: "left",
          title: { display: true, text: "Spend" },
          ticks: { callback: (value) => usd(value, 0) }
        },
        yLeads: {
          beginAtZero: true,
          position: "right",
          grid: { drawOnChartArea: false },
          title: { display: true, text: "Leads" },
          ticks: { precision: 0 }
        }
      }
    }
  });
}

function renderFunnel(totals) {
  const steps = [
    ["Landing Page Visits", totals.lp_visits, null],
    ["Leads (signups)", totals.lp_leads, divide(totals.lp_leads, totals.lp_visits)],
    ["Quiz Submissions", totals.tf_submissions, divide(totals.tf_submissions, totals.lp_leads)]
  ];
  const max = Math.max(...steps.map((step) => step[1]), 0);
  els.funnelEmpty.hidden = max > 0;
  els.funnelSteps.innerHTML = max > 0 ? steps.map(([label, value, rate]) => {
    const width = max ? Math.max(3, (value / max) * 100) : 0;
    const rateText = rate === null ? "Top of funnel" : `${percent(rate * 100)} vs previous`;
    return `
      <div class="funnel-step">
        <div class="funnel-step-header">
          <div>
            <span>${label}</span>
            <strong>${integer(value)}</strong>
          </div>
          <span>${rateText}</span>
        </div>
        <div class="funnel-bar"><div style="width: ${width}%"></div></div>
      </div>
    `;
  }).join("") : "";
}

function renderOutcomes(totals) {
  const outcomes = [
    ["Below 16", totals.out_below16],
    ["Neuro Divergent", totals.out_neuro],
    ["Unqualified", totals.out_unqualified],
    ["Non-Divergent Qualified", totals.out_nondiv_qual]
  ];
  const max = Math.max(...outcomes.map((item) => item[1]), 0);

  els.outcomeGrid.innerHTML = outcomes.map(([label, value]) => {
    const width = max ? (value / max) * 100 : 0;
    return `
      <article class="outcome-card">
        <div class="label">${label}</div>
        <div class="value">${integer(value)}</div>
        <div class="mini-bar"><div style="width: ${width}%"></div></div>
      </article>
    `;
  }).join("");
}

function renderLeadStatuses() {
  const rows = state.leadStatuses
    .map((row) => ({
      status: titleCase(row.status),
      qualified: num(row.qualified),
      unqualified: num(row.unqualified),
      total: num(row.total)
    }))
    .filter((row) => row.status || row.total)
    .sort((a, b) => b.total - a.total);

  els.statusEmpty.hidden = rows.length > 0;
  els.statusTable.hidden = rows.length === 0;

  if (!rows.length) return;

  const max = Math.max(...rows.map((row) => row.total), 1);
  els.statusTable.querySelector("tbody").innerHTML = rows.map((row) => {
    const qWidth = row.total ? (row.qualified / max) * 100 : 0;
    const uWidth = row.total ? (row.unqualified / max) * 100 : 0;
    return `
      <tr>
        <td>
          <div class="status-name">${row.status}</div>
          <div class="status-stack" aria-hidden="true">
            <div class="qualified" style="width: ${qWidth}%"></div>
            <div class="unqualified" style="width: ${uWidth}%"></div>
          </div>
        </td>
        <td>${integer(row.qualified)}</td>
        <td>${integer(row.unqualified)}</td>
        <td>${integer(row.total)}</td>
      </tr>
    `;
  }).join("");

  const totals = rows.reduce((acc, row) => {
    acc.qualified += row.qualified;
    acc.unqualified += row.unqualified;
    acc.total += row.total;
    return acc;
  }, { qualified: 0, unqualified: 0, total: 0 });

  els.statusTable.querySelector("tfoot").innerHTML = `
    <tr>
      <td>Total</td>
      <td>${integer(totals.qualified)}</td>
      <td>${integer(totals.unqualified)}</td>
      <td>${integer(totals.total)}</td>
    </tr>
  `;
}

function renderEmailSequence() {
  const rows = state.emailSequence.filter((row) => row.email);
  els.emailEmpty.hidden = rows.length > 0;
  els.emailTable.hidden = rows.length === 0;

  if (!rows.length) return;

  els.emailTable.querySelector("tbody").innerHTML = rows.slice(0, 7).map((row) => `
    <tr>
      <td>${escapeHtml(row.email)}</td>
      <td>${integer(num(row.sent))}</td>
      <td>${integer(num(row.unique_recipients))}</td>
      <td>${emailPercent(row.delivery_rate)}</td>
      <td>${emailPercent(row.bounce_rate)}</td>
      <td>${emailPercent(row.spam_rate)}</td>
      <td>${emailPercent(row.unsub_rate)}</td>
      <td>${emailPercent(row.open_rate)}</td>
      <td>${emailPercent(row.click_rate)}</td>
    </tr>
  `).join("");
}

function sumDaily(rows) {
  return rows.reduce((acc, row) => {
    for (const key of ["spend", "impressions", "clicks", "lp_leads", "tf_submissions", "lp_visits", "out_below16", "out_neuro", "out_unqualified", "out_nondiv_qual"]) {
      acc[key] += num(row[key]);
    }
    return acc;
  }, {
    spend: 0,
    impressions: 0,
    clicks: 0,
    lp_leads: 0,
    tf_submissions: 0,
    lp_visits: 0,
    out_below16: 0,
    out_neuro: 0,
    out_unqualified: 0,
    out_nondiv_qual: 0
  });
}

function sumNewTop(rows) {
  return rows.reduce((acc, row) => {
    for (const key of ["spend", "impressions", "clicks", "lp_visits", "submissions", "out_a", "out_b", "out_c", "out_d"]) {
      acc[key] += num(row[key]);
    }
    return acc;
  }, {
    spend: 0,
    impressions: 0,
    clicks: 0,
    lp_visits: 0,
    submissions: 0,
    out_a: 0,
    out_b: 0,
    out_c: 0,
    out_d: 0
  });
}

function sumWebinar(rows) {
  return rows.reduce((acc, row) => {
    for (const key of ["spend", "impressions", "clicks", "lp_visits", "reg_11am", "reg_6pm", "reg_total"]) {
      acc[key] += num(row[key]);
    }
    return acc;
  }, {
    spend: 0,
    impressions: 0,
    clicks: 0,
    lp_visits: 0,
    reg_11am: 0,
    reg_6pm: 0,
    reg_total: 0
  });
}

function sumRetargeting(rows) {
  return rows.reduce((acc, row) => {
    for (const key of ["spend", "impressions", "clicks", "lp_visits"]) {
      acc[key] += num(row[key]);
    }
    return acc;
  }, {
    spend: 0,
    impressions: 0,
    clicks: 0,
    lp_visits: 0
  });
}

function renderNewTopSections() {
  const filteredRows = getFilteredNewTopRows();
  const totals = sumNewTop(filteredRows);

  renderNewTopRangeSummary(filteredRows);
  renderNewTopKpis(totals, state.newTopDaily.length === 0);
  renderNewTopTrend(filteredRows);
  renderNewTopFunnel(totals);
  renderNewTopOutcomes(totals);
}

function renderNewTopRangeSummary(rows) {
  if (!state.newTopDaily.length) {
    els.newTopRangeSummary.textContent = "No daily data loaded.";
    return;
  }

  if (!rows.length) {
    els.newTopRangeSummary.textContent = "No daily rows in the selected range.";
    return;
  }

  const first = rows[0].date;
  const last = rows[rows.length - 1].date;
  els.newTopRangeSummary.textContent = first === last ? formatDate(first) : `${formatDate(first)} to ${formatDate(last)}`;
}

function renderNewTopKpis(totals, dataMissing) {
  const kpis = dataMissing ? [
    ["Spend", "&mdash;", "No daily data loaded"],
    ["Page Views", "&mdash;", "No daily data loaded"],
    ["Submissions", "&mdash;", "No daily data loaded"],
    ["Cost per Submission", "&mdash;", "No daily data loaded"],
    ["CTR", "&mdash;", "No daily data loaded"],
    ["CPC", "&mdash;", "No daily data loaded"]
  ] : [
    ["Spend", usd(totals.spend), "Total ad spend"],
    ["Page Views", integer(totals.lp_visits), "Landing-page visits"],
    ["Submissions", integer(totals.submissions), "Quiz submissions"],
    ["Cost per Submission", usd(divide(totals.spend, totals.submissions)), "Spend / submissions"],
    ["CTR", percent(divide(totals.clicks, totals.impressions) * 100), "Clicks / impressions"],
    ["CPC", usd(divide(totals.spend, totals.clicks)), "Spend / clicks"]
  ];

  els.newTopKpiGrid.innerHTML = kpis.map(([label, value, hint]) => `
    <article class="kpi-card">
      <div class="label">${label}</div>
      <div class="value">${value}</div>
      <div class="hint">${hint}</div>
    </article>
  `).join("");
}

function renderNewTopTrend(rows) {
  const ctx = document.querySelector("#newTopTrendChart");
  const hasRows = rows.length > 0;
  els.newTopTrendEmpty.hidden = hasRows;
  ctx.hidden = !hasRows;

  if (!hasRows) {
    if (state.newTopChart) state.newTopChart.destroy();
    state.newTopChart = null;
    return;
  }

  const chartData = {
    labels: rows.map((row) => formatShortDate(row.date)),
    datasets: [
      {
        type: "bar",
        label: "Spend",
        data: rows.map((row) => row.spend),
        backgroundColor: "rgba(34, 103, 173, 0.78)",
        borderRadius: 4,
        yAxisID: "ySpend"
      },
      {
        type: "line",
        label: "Submissions",
        data: rows.map((row) => row.submissions),
        borderColor: "#2f8f6b",
        backgroundColor: "#2f8f6b",
        borderWidth: 3,
        pointRadius: rows.length > 45 ? 0 : 3,
        tension: 0.22,
        yAxisID: "ySubmissions"
      }
    ]
  };

  if (state.newTopChart) {
    state.newTopChart.data = chartData;
    state.newTopChart.update();
    return;
  }

  state.newTopChart = new Chart(ctx, {
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8 } },
        tooltip: {
          callbacks: {
            label: (context) => context.dataset.label === "Spend"
              ? `Spend: ${usd(context.parsed.y)}`
              : `Submissions: ${integer(context.parsed.y)}`
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 10 } },
        ySpend: {
          beginAtZero: true,
          position: "left",
          title: { display: true, text: "Spend" },
          ticks: { callback: (value) => usd(value, 0) }
        },
        ySubmissions: {
          beginAtZero: true,
          position: "right",
          grid: { drawOnChartArea: false },
          title: { display: true, text: "Submissions" },
          ticks: { precision: 0 }
        }
      }
    }
  });
}

function renderNewTopFunnel(totals) {
  const steps = [
    ["Landing Page Views", totals.lp_visits, null],
    ["Quiz Submissions", totals.submissions, divide(totals.submissions, totals.lp_visits)]
  ];
  const max = Math.max(...steps.map((step) => step[1]), 0);
  els.newTopFunnelEmpty.hidden = max > 0;
  els.newTopFunnelSteps.innerHTML = max > 0 ? steps.map(([label, value, rate]) => {
    const width = max ? Math.max(3, (value / max) * 100) : 0;
    const rateText = rate === null ? "Top of funnel" : `${percent(rate * 100)} vs previous`;
    return `
      <div class="funnel-step">
        <div class="funnel-step-header">
          <div>
            <span>${label}</span>
            <strong>${integer(value)}</strong>
          </div>
          <span>${rateText}</span>
        </div>
        <div class="funnel-bar"><div style="width: ${width}%"></div></div>
      </div>
    `;
  }).join("") : "";
}

function renderNewTopOutcomes(totals) {
  const outcomes = [
    ["Result A (Path to Potential)", totals.out_a],
    ["Result B (Path to Potential)", totals.out_b],
    ["Result C (Homeschool Quiz)", totals.out_c],
    ["Result D (Homeschool Quiz)", totals.out_d]
  ];
  const max = Math.max(...outcomes.map((item) => item[1]), 0);

  els.newTopOutcomeGrid.innerHTML = outcomes.map(([label, value]) => {
    const width = max ? (value / max) * 100 : 0;
    return `
      <article class="outcome-card">
        <div class="label">${label}</div>
        <div class="value">${integer(value)}</div>
        <div class="mini-bar"><div style="width: ${width}%"></div></div>
      </article>
    `;
  }).join("");
}

function renderWebinarSections() {
  const filteredRows = getFilteredWebinarRows();
  const totals = sumWebinar(filteredRows);

  renderWebinarRangeSummary(filteredRows);
  renderWebinarKpis(totals, state.webinarDaily.length === 0);
  renderWebinarTrend(filteredRows);
  renderWebinarTimeSlot(totals, state.webinarDaily.length === 0);
}

function renderWebinarRangeSummary(rows) {
  if (!state.webinarDaily.length) {
    els.webinarRangeSummary.textContent = "No daily data loaded.";
    return;
  }

  if (!rows.length) {
    els.webinarRangeSummary.textContent = "No daily rows in the selected range.";
    return;
  }

  const first = rows[0].date;
  const last = rows[rows.length - 1].date;
  els.webinarRangeSummary.textContent = first === last ? formatDate(first) : `${formatDate(first)} to ${formatDate(last)}`;
}

function renderWebinarKpis(totals, dataMissing) {
  const kpis = dataMissing ? [
    ["Spend", "&mdash;", "No daily data loaded"],
    ["Page Views", "&mdash;", "No daily data loaded"],
    ["Registrations", "&mdash;", "No daily data loaded"],
    ["11 AM Registrations", "&mdash;", "No daily data loaded"],
    ["6 PM Registrations", "&mdash;", "No daily data loaded"],
    ["CPC", "&mdash;", "No daily data loaded"],
    ["CTR", "&mdash;", "No daily data loaded"]
  ] : [
    ["Spend", usd(totals.spend), "Total ad spend"],
    ["Page Views", integer(totals.lp_visits), "Landing-page visits"],
    ["Registrations", integer(totals.reg_total), "11 AM + 6 PM lists"],
    ["11 AM Registrations", integer(totals.reg_11am), "11 AM time slot"],
    ["6 PM Registrations", integer(totals.reg_6pm), "6 PM time slot"],
    ["CPC", usd(divide(totals.spend, totals.clicks)), "Spend / clicks"],
    ["CTR", percent(divide(totals.clicks, totals.impressions) * 100), "Clicks / impressions"]
  ];

  els.webinarKpiGrid.innerHTML = kpis.map(([label, value, hint]) => `
    <article class="kpi-card">
      <div class="label">${label}</div>
      <div class="value">${value}</div>
      <div class="hint">${hint}</div>
    </article>
  `).join("");
}

function renderWebinarTrend(rows) {
  const ctx = document.querySelector("#webinarTrendChart");
  const hasRows = rows.length > 0;
  els.webinarTrendEmpty.hidden = hasRows;
  ctx.hidden = !hasRows;

  if (!hasRows) {
    if (state.webinarChart) state.webinarChart.destroy();
    state.webinarChart = null;
    return;
  }

  const chartData = {
    labels: rows.map((row) => formatShortDate(row.date)),
    datasets: [
      {
        type: "bar",
        label: "Spend",
        data: rows.map((row) => row.spend),
        backgroundColor: "rgba(34, 103, 173, 0.78)",
        borderRadius: 4,
        yAxisID: "ySpend"
      },
      {
        type: "line",
        label: "Registrations",
        data: rows.map((row) => row.reg_total),
        borderColor: "#2f8f6b",
        backgroundColor: "#2f8f6b",
        borderWidth: 3,
        pointRadius: rows.length > 45 ? 0 : 3,
        tension: 0.22,
        yAxisID: "yRegistrations"
      }
    ]
  };

  if (state.webinarChart) {
    state.webinarChart.data = chartData;
    state.webinarChart.update();
    return;
  }

  state.webinarChart = new Chart(ctx, {
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8 } },
        tooltip: {
          callbacks: {
            label: (context) => context.dataset.label === "Spend"
              ? `Spend: ${usd(context.parsed.y)}`
              : `Registrations: ${integer(context.parsed.y)}`
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 10 } },
        ySpend: {
          beginAtZero: true,
          position: "left",
          title: { display: true, text: "Spend" },
          ticks: { callback: (value) => usd(value, 0) }
        },
        yRegistrations: {
          beginAtZero: true,
          position: "right",
          grid: { drawOnChartArea: false },
          title: { display: true, text: "Registrations" },
          ticks: { precision: 0 }
        }
      }
    }
  });
}

function renderWebinarTimeSlot(totals, dataMissing) {
  els.webinarTimeSlotEmpty.hidden = !dataMissing;
  els.webinarTimeSlot.hidden = dataMissing;
  if (dataMissing) return;

  const slots = [
    ["11 AM", totals.reg_11am],
    ["6 PM", totals.reg_6pm]
  ];
  const max = Math.max(...slots.map((slot) => slot[1]), 0);

  els.webinarTimeSlot.innerHTML = slots.map(([label, value]) => {
    const width = max ? (value / max) * 100 : 0;
    return `
      <article class="outcome-card">
        <div class="label">${label}</div>
        <div class="value">${integer(value)}</div>
        <div class="mini-bar"><div style="width: ${width}%"></div></div>
      </article>
    `;
  }).join("");
}

function renderWebinarEmails() {
  const rows = state.webinarEmails.filter((row) => row.email);
  els.webinarEmailEmpty.hidden = rows.length > 0;
  els.webinarEmailTable.hidden = rows.length === 0;

  if (!rows.length) return;

  els.webinarEmailTable.querySelector("tbody").innerHTML = rows.slice(0, 7).map((row) => `
    <tr>
      <td>${escapeHtml(row.email)}</td>
      <td>${integer(num(row.sent))}</td>
      <td>${integer(num(row.unique_recipients))}</td>
      <td>${emailPercent(row.delivery_rate)}</td>
      <td>${emailPercent(row.bounce_rate)}</td>
      <td>${emailPercent(row.spam_rate)}</td>
      <td>${emailPercent(row.unsub_rate)}</td>
      <td>${emailPercent(row.open_rate)}</td>
    </tr>
  `).join("");
}

function renderRetargetingSections() {
  const filteredRows = getFilteredRetargetingRows();
  const totals = sumRetargeting(filteredRows);

  renderRetargetingRangeSummary(filteredRows);
  renderRetargetingKpis(totals, state.retargetingDaily.length === 0);
  renderRetargetingTrend(filteredRows);
}

function renderRetargetingRangeSummary(rows) {
  if (!state.retargetingDaily.length) {
    els.retargetingRangeSummary.textContent = "No daily data loaded.";
    return;
  }

  if (!rows.length) {
    els.retargetingRangeSummary.textContent = "No daily rows in the selected range.";
    return;
  }

  const first = rows[0].date;
  const last = rows[rows.length - 1].date;
  els.retargetingRangeSummary.textContent = first === last ? formatDate(first) : `${formatDate(first)} to ${formatDate(last)}`;
}

function renderRetargetingKpis(totals, dataMissing) {
  const kpis = dataMissing ? [
    ["Spend", "&mdash;", "No daily data loaded"],
    ["Page Views", "&mdash;", "No daily data loaded"],
    ["Clicks", "&mdash;", "No daily data loaded"],
    ["CPC", "&mdash;", "No daily data loaded"],
    ["CTR", "&mdash;", "No daily data loaded"]
  ] : [
    ["Spend", usd(totals.spend), "Total ad spend"],
    ["Page Views", integer(totals.lp_visits), "Landing-page visits"],
    ["Clicks", integer(totals.clicks), "Ad clicks"],
    ["CPC", usd(divide(totals.spend, totals.clicks)), "Spend / clicks"],
    ["CTR", percent(divide(totals.clicks, totals.impressions) * 100), "Clicks / impressions"]
  ];

  els.retargetingKpiGrid.innerHTML = kpis.map(([label, value, hint]) => `
    <article class="kpi-card">
      <div class="label">${label}</div>
      <div class="value">${value}</div>
      <div class="hint">${hint}</div>
    </article>
  `).join("");
}

function renderRetargetingTrend(rows) {
  const ctx = document.querySelector("#retargetingTrendChart");
  const hasRows = rows.length > 0;
  els.retargetingTrendEmpty.hidden = hasRows;
  ctx.hidden = !hasRows;

  if (!hasRows) {
    if (state.retargetingChart) state.retargetingChart.destroy();
    state.retargetingChart = null;
    return;
  }

  const chartData = {
    labels: rows.map((row) => formatShortDate(row.date)),
    datasets: [
      {
        type: "bar",
        label: "Spend",
        data: rows.map((row) => row.spend),
        backgroundColor: "rgba(34, 103, 173, 0.78)",
        borderRadius: 4,
        yAxisID: "ySpend"
      },
      {
        type: "line",
        label: "Clicks",
        data: rows.map((row) => row.clicks),
        borderColor: "#2f8f6b",
        backgroundColor: "#2f8f6b",
        borderWidth: 3,
        pointRadius: rows.length > 45 ? 0 : 3,
        tension: 0.22,
        yAxisID: "yClicks"
      }
    ]
  };

  if (state.retargetingChart) {
    state.retargetingChart.data = chartData;
    state.retargetingChart.update();
    return;
  }

  state.retargetingChart = new Chart(ctx, {
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8 } },
        tooltip: {
          callbacks: {
            label: (context) => context.dataset.label === "Spend"
              ? `Spend: ${usd(context.parsed.y)}`
              : `Clicks: ${integer(context.parsed.y)}`
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 10 } },
        ySpend: {
          beginAtZero: true,
          position: "left",
          title: { display: true, text: "Spend" },
          ticks: { callback: (value) => usd(value, 0) }
        },
        yClicks: {
          beginAtZero: true,
          position: "right",
          grid: { drawOnChartArea: false },
          title: { display: true, text: "Clicks" },
          ticks: { precision: 0 }
        }
      }
    }
  });
}

function findMeta(key) {
  const row = state.meta.find((item) => String(item.key || "").trim() === key);
  return row ? row.value : "";
}

function hasAnyValue(row) {
  return Object.values(row || {}).some((value) => value !== null && value !== undefined && String(value).trim() !== "");
}

function num(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[$,%\s,]/g, "");
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function divide(a, b) {
  return b ? a / b : null;
}

function usd(value, digits = 2) {
  if (value === null || !Number.isFinite(value)) return "&mdash;";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(value);
}

function integer(value) {
  if (value === null || !Number.isFinite(value)) return "&mdash;";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function percent(value) {
  if (value === null || !Number.isFinite(value)) return "&mdash;";
  return `${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)}%`;
}

function rate(value) {
  if (value === null || value === undefined || value === "") return "&mdash;";
  if (typeof value === "string" && value.includes("%")) return percent(num(value));
  const numeric = num(value);
  return percent(Math.abs(numeric) <= 1 ? numeric * 100 : numeric);
}

function emailPercent(value) {
  if (value === null || value === undefined || value === "") return "&mdash;";
  if (typeof value === "number" && Number.isFinite(value)) return `${value}%`;
  const cleaned = String(value).trim().replace(/%$/, "");
  return cleaned ? `${cleaned}%` : "&mdash;";
}

function titleCase(value) {
  return String(value || "")
    .trim()
    .split(/\s+/)
    .map((word) => word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : "")
    .join(" ");
}

function formatDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(year, month - 1, day));
}

function formatShortDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(new Date(year, month - 1, day));
}

function shiftDate(value, days) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showGlobalNotice(message) {
  els.errorBanner.textContent = message;
  els.errorBanner.hidden = false;
}
