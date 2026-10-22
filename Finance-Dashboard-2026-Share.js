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
document.getElementById("export").onclick = () => {
  const blob = new Blob(
      [JSON.stringify({ version: 1, year: 2026, data: empty() }, null, 2)],
      { type: "application/json" },
    ),
    a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "finance-dashboard-2026-template.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};
document.getElementById("importBtn").onclick = () =>
  document.getElementById("importFile").click();
document.getElementById("importFile").onchange = async (e) => {
  try {
    let content = JSON.parse(await e.target.files[0].text()),
      data = content.data || content,
      next = empty(),
      found = 0;
    for (let k of KEYS)
      if (typeof data[k] === "number" && Number.isFinite(data[k])) {
        next[k] = Math.max(0, data[k]);
        found++;
      }
    if (!found) throw new Error("no fields");
    state = next;
    loaded = true;
    render();
  } catch {
    alert("לא ניתן לטעון את הקובץ. יש לטעון JSON במבנה קובץ התבנית.");
  }
  e.target.value = "";
};
document.getElementById("print").onclick = () => window.print();
render();
