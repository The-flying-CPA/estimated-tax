const KEYS = [
  "rev9",
  "monthlyQ4",
  "profit",
  "credits",
  "tax",
  "taxAfter",
  "niBase",
  "niCeiling",
  "niMonthly",
  "pensionMandatory",
  "pension",
  "study",
  "pensionSave",
  "studySave",
  "taxPaid",
  "withheld",
  "niPaid",
  "pensionPaid",
  "studyPaid"
];
const empty = () => Object.fromEntries(KEYS.map((k) => [k, 0]));
let state = empty(),
  loaded = false;
// Remove anything saved by earlier versions of this app.
try {
  localStorage.removeItem("finance_dash_2026_v1");
} catch {}
const fmt = (n) =>
    loaded ? Math.round(n).toLocaleString("he-IL") + " ₪" : "—",
  pct = (n) =>
    loaded
      ? (n * 100).toLocaleString("he-IL", { maximumFractionDigits: 2 }) + "%"
      : "—",
  put = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  },
  num = (k) => Math.max(0, Number(state[k]) || 0);
let annual = () => num("rev9") + 3 * num("monthlyQ4");
let rate = () => (annual() > 0 ? num("tax") / annual() : 0);
const settings = [
  ["rev9", "מחזור ינואר–ספטמבר"],
  ["monthlyQ4", "תחזית מחזור חודשי באוקטובר–דצמבר"],
  ["profit", "הכנסה חייבת לפני ניכויים אישיים"],
  ["credits", "נקודות זיכוי"],
  ["tax", "מס הכנסה שנתי לפני הפקדות"],
  ["taxAfter", "מס הכנסה לאחר הפקדות מלאות"],
  ["niBase", "הכנסה חודשית לביטוח לאומי לפני תקרה"],
  ["niCeiling", "תקרת בסיס חודשית לביטוח לאומי"],
  ["niMonthly", "אומדן מקדמה חודשית לביטוח לאומי"],
  ["pensionMandatory", "פנסיית חובה שנתית"],
  ["pension", "יעד שנתי לפנסיה"],
  ["study", "יעד שנתי לקרן השתלמות"],
  ["pensionSave", "חיסכון במס מפנסיה בהפקדה מלאה"],
  ["studySave", "חיסכון במס מקרן השתלמות בהפקדה מלאה"],
];
let fields = document.getElementById("settingsFields");
fields.innerHTML = settings
  .map(
    ([k, label]) =>
      `<div class="metric"><span>${label}</span><b id="s-${k}"></b></div>`,
  )
  .join("");
function render() {
  let a = annual(),
    r = rate(),
    t9 = r * num("rev9"),
    paid = num("taxPaid") + num("withheld"),
    gap = t9 - paid,
    niGap = 9 * num("niMonthly") - num("niPaid"),
    pRemain = Math.max(0, num("pension") - num("pensionPaid")),
    sRemain = Math.max(0, num("study") - num("studyPaid")),
    saving = Math.max(0, num("tax") - num("taxAfter"));
  const money = {
    chipProfit: num("profit"),
    revenue: a,
    incomeTax: num("tax"),
    totalSaving: saving,
    advanceTarget: t9,
    advancePaid: paid,
    advanceGap: gap,
    pensionGoal: num("pension"),
    pensionRemain: pRemain,
    studyGoal: num("study"),
    studyRemain: sRemain,
    taxBefore: num("tax"),
    taxAfter: num("taxAfter"),
    savingRepeat: saving,
    taxTarget2: t9,
    taxGap2: gap,
    annualRev2: a,
    profit2: num("profit"),
    tax2: num("tax"),
    rev9: num("rev9"),
    niBase: num("niBase"),
    niCapped: Math.min(num("niBase"), num("niCeiling")),
    niMonthly: num("niMonthly"),
    niTarget: 9 * num("niMonthly"),
    niGap,
    pensionMandatory: num("pensionMandatory"),
    pensionGoal2: num("pension"),
    pensionMandatoryGap: Math.max(
      0,
      num("pensionMandatory") - num("pensionPaid"),
    ),
    pensionRemaining2: pRemain,
    pensionTaxSave: num("pensionSave"),
    studyGoal2: num("study"),
    studyRemaining2: sRemain,
    studyTaxSave: num("studySave"),
    taxPaid: num("taxPaid"),
    withheld: num("withheld"),
    niPaid: num("niPaid"),
    pensionPaid: num("pensionPaid"),
    studyPaid: num("studyPaid"),
  };
  Object.entries(money).forEach(([k, v]) => put(k, fmt(v)));
  ["advanceGap", "taxGap2", "niGap"].forEach(
    (id) =>
      (document.getElementById(id).className =
        !loaded ? "" : money[id] > 0 ? "negative" : "positive"),
  );
  ["advanceRate", "taxRate2"].forEach((id) => put(id, pct(r)));
  put("advanceCoverage", pct(t9 ? paid / t9 : 0));
  document.getElementById("advanceBar").style.width =
    Math.min(100, t9 ? (100 * paid) / t9 : 0) + "%";
  document.getElementById("taxAfterBar").style.width =
    Math.min(100, num("tax") ? (100 * num("taxAfter")) / num("tax") : 0) +
    "%";
  let bar = document.getElementById("revenueChart");
  bar.innerHTML = "";
  let values = Array(9)
      .fill(num("rev9") / 9)
      .concat(Array(3).fill(num("monthlyQ4"))),
    max = Math.max(1, ...values);
  values.forEach((v, i) => {
    let col = document.createElement("div");
    col.className = "chart-col";
    let stick = document.createElement("div");
    stick.title = fmt(v);
    stick.className = `chart-stick${i >= 9 ? " forecast" : ""}`;
    stick.style.height = `${Math.max(2, (v / max) * 96)}%`;
    col.append(stick);
    let label = document.createElement("div");
    label.className = "chart-label";
    label.textContent = i + 1;
    col.append(label);
    bar.appendChild(col);
  });
  settings.forEach(([k]) =>
    put(
      `s-${k}`,
      k === "credits"
        ? loaded
          ? num(k).toLocaleString("he-IL")
          : "—"
        : fmt(num(k)),
    ),
  );
  put("chipCredits", loaded ? num("credits").toLocaleString("he-IL") : "—");
  document.getElementById("emptyState").classList.toggle("hidden", loaded);
}
function tab(id) {
  document
    .querySelectorAll(".tab")
    .forEach((el) => el.classList.toggle("hidden", el.id !== id));
  document
    .querySelectorAll(".nav")
    .forEach((el) =>
      el.classList.toggle("active", el.dataset.tab === id),
    );
  window.scrollTo({ top: 0, behavior: "smooth" });
}
document
  .querySelectorAll("[data-tab]")
  .forEach((el) => (el.onclick = () => tab(el.dataset.tab)));
document
  .querySelectorAll("[data-goto]")
  .forEach((el) => (el.onclick = () => tab(el.dataset.goto)));
document.getElementById("reset").onclick = () => {
  state = empty();
  loaded = false;
  render();
};
const LABELS = Object.fromEntries([
  ...settings,
  ["taxPaid", "מקדמות מס הכנסה ששולמו עד ספטמבר"],
  ["withheld", "ניכוי מס במקור עד ספטמבר"],
  ["niPaid", "ביטוח לאומי ששולם עד ספטמבר"],
  ["pensionPaid", "הפקדות לפנסיה שבוצעו עד כה"],
  ["studyPaid", "הפקדות לקרן השתלמות שבוצעו עד כה"],
]);
const toNum = (v) => {
  if (typeof v === "number") return v;
  if (typeof v !== "string") return NaN;
  const t = v.replace(/[\s,₪]/g, "");
  return t ? Number(t) : NaN;
};
// Row labels in the tax-calculation workbook (sheets "תחזית ותיאום" and
// "מקדמות וחיסכון"). [label, "last"] takes the row's last numeric cell instead
// of the first, e.g. the "after pension and study fund" column of the tax table.
const ALIASES = {
  rev9: ["הכנסות ינואר–ספטמבר"],
  monthlyQ4: ["הכנסה חודשית מאוקטובר עד דצמבר"],
  profit: [
    "הכנסה מעסק לפני ניכויים אישיים",
    "הכנסה חייבת מעסק — לפני ניכויים אישיים",
  ],
  tax: ["מס הכנסה נטו — חבות שנתית"],
  taxAfter: [["מס הכנסה נטו — חבות שנתית", "last"]],
  niBase: ["הכנסה משוערת לאחר ניכויים מותרים, לפני תקרה"],
  niCeiling: ["תקרת הכנסה חודשית לדמי ביטוח"],
  niMonthly: ["ביטוח לאומי ובריאות — אומדן לחודש"],
  pensionMandatory: ["חובת הפקדה בסיסית לפנסיה (אם חלה)"],
  pension: ["יעד הפקדה לפנסיה למיצוי הטבת מס"],
  study: ["יעד השתלמות כולל הטבת רווחים"],
  pensionSave: ["מס הכנסה שנחסך בפנסיה"],
  studySave: ["מס הכנסה שנחסך בהשתלמות"],
  withheld: ["ניכוי מס במקור מלקוחות עד ספטמבר"],
  niPaid: ["מקדמות ביטוח לאומי ששולמו עד ספטמבר"],
  pensionPaid: ["הפקדות לפנסיה שכבר בוצעו ב־2026"],
  studyPaid: ["הפקדות להשתלמות שכבר בוצעו ב־2026"],
};
// Ignore whitespace, case and the kind of dash (-, –, —, maqaf) when comparing labels.
const norm = (s) =>
  String(s ?? "")
    .replace(/[‐-―־-]/g, "-")
    .replace(/\s+/g, "")
    .toLowerCase();
// Normalized label -> fields read from that row: field key, template label, aliases.
const ROWS = new Map();
const addRow = (label, k, pick = "first") => {
  const t = norm(label);
  if (!ROWS.has(t)) ROWS.set(t, []);
  ROWS.get(t).push({ k, pick });
};
KEYS.forEach((k) => {
  addRow(k, k);
  addRow(LABELS[k], k);
  (ALIASES[k] || []).forEach((a) => {
    const [label, pick] = [a].flat();
    addRow(label, k, pick);
  });
});
// The first cell with a known label marks the row; its value is the first (or
// last) numeric cell after the label. The first occurrence of each field wins.
function readSheet(buf) {
  const wb = XLSX.read(buf, { type: "array" }),
    data = {};
  for (const name of wb.SheetNames)
    for (const row of XLSX.utils.sheet_to_json(wb.Sheets[name], {
      header: 1,
      raw: true,
    })) {
      const i = row.findIndex((c) => ROWS.has(norm(c)));
      if (i < 0) continue;
      const nums = row.slice(i + 1).map(toNum).filter(Number.isFinite);
      if (!nums.length) continue;
      for (const { k, pick } of ROWS.get(norm(row[i])))
        if (!(k in data)) data[k] = pick === "last" ? nums.at(-1) : nums[0];
    }
  return data;
}
document.getElementById("export").onclick = () => {
  const ws = XLSX.utils.aoa_to_sheet([
      ["שדה", "תיאור", "ערך"],
      ...KEYS.map((k) => [k, LABELS[k], 0]),
    ]),
    wb = XLSX.utils.book_new();
  ws["!cols"] = [{ wch: 18 }, { wch: 40 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws, "נתונים");
  wb.Workbook = { Views: [{ RTL: true }] };
  XLSX.writeFile(wb, "finance-dashboard-2026-template.xlsx");
};
document.getElementById("importBtn").onclick = () =>
  document.getElementById("importFile").click();
document.getElementById("importFile").onchange = async (e) => {
  try {
    const file = e.target.files[0];
    let data;
    if (/\.json$/i.test(file.name)) {
      const content = JSON.parse(await file.text());
      data = content.data || content;
    } else data = readSheet(await file.arrayBuffer());
    let next = empty(),
      found = 0;
    for (let k of KEYS) {
      const v = toNum(data[k]);
      if (Number.isFinite(v)) {
        next[k] = Math.max(0, v);
        found++;
      }
    }
    if (!found) throw new Error("no fields");
    state = next;
    loaded = true;
    render();
  } catch {
    alert(
      "לא ניתן לטעון את הקובץ. יש לטעון קובץ Excel, CSV או JSON במבנה קובץ התבנית.",
    );
  }
  e.target.value = "";
};
document.getElementById("print").onclick = () => window.print();
render();
