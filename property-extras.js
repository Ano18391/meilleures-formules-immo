(() => {
    "use strict";

    const $ = (s, root = document) => root.querySelector(s);
    const money = n => new Intl.NumberFormat("en-GB", {
        style: "currency", currency: "EUR", maximumFractionDigits: 0
    }).format(Number.isFinite(n) ? n : 0);
    const percent = n => `${(Number.isFinite(n) ? n : 0).toFixed(2)}%`;
    const escape = s => String(s ?? "").replace(/[&<>"']/g, c =>
        ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])
    );

    const STORE = "property-formulas-comparison-v1";
    const fieldIds = [
        "purchase-price", "acquisition-fees", "renovation-cost",
        "monthly-rent", "monthly-charges", "monthly-tax",
        "loan-amount", "interest-rate", "loan-years"
    ];

    function readProperty() {
        const data = {};
        for (const id of fieldIds) {
            const field = document.getElementById(id);
            if (!field || field.value.trim() === "") {
                return { error: `Please complete the property form, including ${id.replaceAll("-", " ")}.` };
            }
            const value = Number(field.value);
            if (!Number.isFinite(value) || value < 0) {
                return { error: `Please check the value for ${id.replaceAll("-", " ")}.` };
            }
            data[id] = value;
        }

        if (data["purchase-price"] <= 0 || data["loan-years"] <= 0) {
            return { error: "Purchase price and loan term must be greater than zero." };
        }

        return {
            data,
            title: $("#dossier-title")?.value.trim()
                || $("#property-address")?.value.trim()
                || "Property analysis"
        };
    }

    function loanPayment(principal, annualRate, years) {
        if (principal <= 0 || years <= 0) return 0;
        const months = years * 12;
        const rate = annualRate / 1200;
        return rate === 0
            ? principal / months
            : principal * rate / (1 - Math.pow(1 + rate, -months));
    }

    function calculate(d) {
        const price = d["purchase-price"];
        const total = price + d["acquisition-fees"] + d["renovation-cost"];
        const rent = d["monthly-rent"];
        const expenses = d["monthly-charges"] + d["monthly-tax"];
        const payment = loanPayment(d["loan-amount"], d["interest-rate"], d["loan-years"]);

        return {
            total,
            gross: rent * 1200 / price,
            net: (rent - expenses) * 1200 / Math.max(total, 1),
            payment,
            cashflow: rent - expenses - payment
        };
    }

    function loadComparisons() {
        try {
            const list = JSON.parse(localStorage.getItem(STORE) || "[]");
            return Array.isArray(list) ? list : [];
        } catch {
            return [];
        }
    }

    function saveComparisons(list) {
        localStorage.setItem(STORE, JSON.stringify(list));
    }

    function panel(title, kicker, description, id, body) {
        return `
            <section class="pe-panel" id="${id}">
                <div class="pe-heading">
                    <div>
                        <p class="pe-kicker">${kicker}</p>
                        <h3>${title}</h3>
                        <p>${description}</p>
                    </div>
                </div>
                ${body}
            </section>`;
    }

    function installInterface() {
        const section = $("#dossier-immo");
        if (!section || $("#property-extras")) return;

        const wrapper = document.createElement("div");
        wrapper.id = "property-extras";
        wrapper.className = "property-extras";

        wrapper.innerHTML =
            panel(
                "Professional Property Report",
                "EXPORT & PRESENTATION",
                "Create a print-ready report from the current property figures.",
                "pe-report",
                `<button class="pe-button pe-primary" id="pe-export" type="button">Generate report ↗</button>
                 <p class="pe-message" id="pe-report-message" role="status"></p>
                 <p class="pe-note">Choose “Save as PDF” in your browser's print dialog. This report is an estimate, not a certified valuation.</p>`
            ) +
            panel(
                "Property Comparison",
                "SIDE-BY-SIDE ANALYSIS",
                "Save the current figures and compare several properties in this browser.",
                "pe-comparison",
                `<div class="pe-actions">
                    <button class="pe-button pe-primary" id="pe-add" type="button">Add current property</button>
                    <button class="pe-button" id="pe-clear" type="button">Clear comparison</button>
                 </div>
                 <p class="pe-message" id="pe-comparison-message" role="status"></p>
                 <div id="pe-table"></div>
                 <p class="pe-note">Comparison entries are saved locally in this browser, not in your Neon account.</p>`
            ) +
            panel(
                "What-if Scenario Simulator",
                "INVESTMENT STRESS TEST",
                "Adjust the assumptions and see how estimated monthly cash flow changes.",
                "pe-scenario",
                `<div class="pe-controls">
                    <label>Monthly rent change <strong id="pe-rent-value">0%</strong>
                        <input id="pe-rent" type="range" min="-30" max="30" value="0" step="1">
                    </label>
                    <label>Monthly expenses change <strong id="pe-expense-value">0%</strong>
                        <input id="pe-expenses" type="range" min="-20" max="100" value="0" step="1">
                    </label>
                    <label>Interest-rate change <strong id="pe-rate-value">+0.00 points</strong>
                        <input id="pe-rate" type="range" min="-1" max="3" value="0" step="0.25">
                    </label>
                    <label>Vacancy / rent loss <strong id="pe-vacancy-value">0%</strong>
                        <input id="pe-vacancy" type="range" min="0" max="20" value="0" step="1">
                    </label>
                 </div>
                 <div class="pe-metrics">
                    <article><span>Base monthly cash flow</span><strong id="pe-base">—</strong></article>
                    <article><span>Scenario cash flow</span><strong id="pe-result">—</strong></article>
                    <article><span>Difference</span><strong id="pe-difference">—</strong></article>
                 </div>
                 <p class="pe-message" id="pe-scenario-message" role="status"></p>
                 <p class="pe-note">Indicative simulation. It does not include costs or risks not entered in the dossier.</p>`
            );

        section.appendChild(wrapper);
        $("#pe-export").addEventListener("click", exportReport);
        $("#pe-add").addEventListener("click", addProperty);
        $("#pe-clear").addEventListener("click", () => {
            if (!confirm("Clear all locally saved comparison entries?")) return;
            localStorage.removeItem(STORE);
            renderComparison();
            $("#pe-comparison-message").textContent = "Comparison cleared.";
        });

        $("#pe-table").addEventListener("click", event => {
            const button = event.target.closest("[data-remove]");
            if (!button) return;
            saveComparisons(loadComparisons().filter(item => item.id !== button.dataset.remove));
            renderComparison();
        });

        ["pe-rent", "pe-expenses", "pe-rate", "pe-vacancy"].forEach(id => {
            $("#" + id).addEventListener("input", renderScenario);
        });

        const form = $("#dossier-form");
        if (form) {
            form.addEventListener("input", renderScenario);
            form.addEventListener("change", renderScenario);
        }

        renderComparison();
        renderScenario();
    }

    function exportReport() {
        const property = readProperty();
        const message = $("#pe-report-message");
        if (property.error) {
            message.textContent = property.error;
            return;
        }

        const d = property.data;
        const m = calculate(d);
        const rows = [
            ["Purchase price", money(d["purchase-price"])],
            ["Acquisition costs", money(d["acquisition-fees"])],
            ["Renovation budget", money(d["renovation-cost"])],
            ["Total project cost", money(m.total)],
            ["Loan amount", money(d["loan-amount"])],
            ["Annual interest rate", percent(d["interest-rate"])],
            ["Loan term", `${d["loan-years"]} years`],
            ["Monthly rent", money(d["monthly-rent"])],
            ["Monthly expenses and taxes", money(d["monthly-charges"] + d["monthly-tax"])],
            ["Estimated monthly loan payment", money(m.payment)],
            ["Gross rental yield", percent(m.gross)],
            ["Estimated net operating yield", percent(m.net)],
            ["Estimated monthly cash flow", money(m.cashflow)]
        ];

        const reportWindow = window.open("", "_blank");
        if (!reportWindow) {
            message.textContent = "Pop-up blocked. Allow pop-ups for this site and try again.";
            return;
        }

        const rowsHtml = rows.map(([label, value]) =>
            `<tr><td>${escape(label)}</td><td>${escape(value)}</td></tr>`
        ).join("");

        reportWindow.document.open();
        reportWindow.document.write(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Property Report — ${escape(property.title)}</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#edf1ed;color:#24352a;font:14px/1.6 Arial,sans-serif}
.sheet{max-width:850px;margin:28px auto;padding:42px;background:#fff;box-shadow:0 10px 35px #17251c12}
header{border-bottom:2px solid #dbe6dc;padding-bottom:20px;display:flex;justify-content:space-between;gap:20px}
.brand{font-size:12px;letter-spacing:3px;color:#267349;font-weight:bold}
h1{font-size:30px;letter-spacing:-1px;margin:28px 0 6px}p{color:#637267}
.summary{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:24px 0}
.metric{padding:16px;border:1px solid #dce6de;border-radius:10px}
.metric span{display:block;color:#637267;font-size:12px}.metric strong{display:block;font-size:21px;margin-top:7px}
table{width:100%;border-collapse:collapse;margin-top:20px}td{padding:12px 8px;border-bottom:1px solid #e2e9e3}td:last-child{text-align:right;font-weight:bold}
.notice{margin-top:24px;background:#f2f6f2;padding:15px;font-size:12px;color:#637267}
button{display:block;margin:20px auto;padding:12px 20px;border:0;border-radius:8px;background:#246b45;color:white;font-weight:bold;cursor:pointer}
@media(max-width:600px){.sheet{padding:20px;margin:0}.summary{grid-template-columns:1fr 1fr}h1{font-size:24px}}
@media print{body{background:#fff}.sheet{margin:0;padding:8mm;box-shadow:none}button{display:none}@page{size:A4;margin:10mm}}
</style></head><body>
<button onclick="window.print()">Print / Save as PDF</button>
<main class="sheet">
<header><div><div class="brand">PROPERTY FORMULAS</div><p>Property investment report</p></div><p>${escape(new Date().toLocaleDateString("en-GB"))}</p></header>
<h1>${escape(property.title)}</h1>
<p>An indicative summary based on the figures entered in the property dossier.</p>
<div class="summary">
<div class="metric"><span>Total project cost</span><strong>${escape(money(m.total))}</strong></div>
<div class="metric"><span>Gross rental yield</span><strong>${escape(percent(m.gross))}</strong></div>
<div class="metric"><span>Monthly cash flow</span><strong>${escape(money(m.cashflow))}</strong></div>
</div>
<h2>Financial assumptions</h2><table>${rowsHtml}</table>
<div class="notice"><strong>Important:</strong> This report is an indicative estimate, not a certified valuation, credit decision or financial advice. Actual results may differ due to vacancy, insurance, repairs, management fees, taxes, local regulations and other costs not entered in the form. Verify all figures independently.</div>
</main></body></html>`);
        reportWindow.document.close();
        message.textContent = "Report opened. Use Print / Save as PDF in the report window.";
    }

    function addProperty() {
        const property = readProperty();
        const message = $("#pe-comparison-message");
        if (property.error) {
            message.textContent = property.error;
            return;
        }

        const list = loadComparisons();
        if (list.length >= 12) {
            message.textContent = "Maximum 12 properties. Remove one before adding another.";
            return;
        }

        list.push({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            title: property.title,
            metrics: calculate(property.data)
        });

        try {
            saveComparisons(list);
            message.textContent = "Property added to the comparison list.";
            renderComparison();
        } catch {
            message.textContent = "Could not save locally. Check your browser storage settings.";
        }
    }

    function renderComparison() {
        const target = $("#pe-table");
        if (!target) return;
        const list = loadComparisons();

        if (!list.length) {
            target.innerHTML = '<div class="pe-empty">No properties saved yet. Add the current property to start comparing.</div>';
            return;
        }

        target.innerHTML = `<div class="pe-table-wrap"><table class="pe-table">
<thead><tr><th>Property</th><th>Total cost</th><th>Gross yield</th><th>Net yield</th><th>Monthly cash flow</th><th></th></tr></thead><tbody>
${list.map(item => `<tr>
<td><strong>${escape(item.title)}</strong></td>
<td>${escape(money(item.metrics.total))}</td>
<td>${escape(percent(item.metrics.gross))}</td>
<td>${escape(percent(item.metrics.net))}</td>
<td class="${item.metrics.cashflow >= 0 ? "pe-positive" : "pe-negative"}">${escape(money(item.metrics.cashflow))}</td>
<td><button type="button" class="pe-button pe-remove" data-remove="${escape(item.id)}">Remove</button></td>
</tr>`).join("")}
</tbody></table></div>`;
    }

    function renderScenario() {
        const message = $("#pe-scenario-message");
        if (!message) return;
        const property = readProperty();

        if (property.error) {
            message.textContent = "Complete the property dossier form to calculate the scenario.";
            ["pe-base", "pe-result", "pe-difference"].forEach(id => { $("#" + id).textContent = "—"; });
            return;
        }

        const d = property.data;
        const base = calculate(d);
        const rentChange = Number($("#pe-rent").value) / 100;
        const expenseChange = Number($("#pe-expenses").value) / 100;
        const rateChange = Number($("#pe-rate").value);
        const vacancy = Number($("#pe-vacancy").value) / 100;

        $("#pe-rent-value").textContent = `${Math.round(rentChange * 100)}%`;
        $("#pe-expense-value").textContent = `${Math.round(expenseChange * 100)}%`;
        $("#pe-rate-value").textContent = `${rateChange >= 0 ? "+" : ""}${rateChange.toFixed(2)} points`;
        $("#pe-vacancy-value").textContent = `${Math.round(vacancy * 100)}%`;

        const rent = d["monthly-rent"] * (1 + rentChange) * (1 - vacancy);
        const expenses = (d["monthly-charges"] + d["monthly-tax"]) * (1 + expenseChange);
        const rate = Math.max(0, d["interest-rate"] + rateChange);
        const payment = loanPayment(d["loan-amount"], rate, d["loan-years"]);
        const result = rent - expenses - payment;
        const difference = result - base.cashflow;

        $("#pe-base").textContent = money(base.cashflow);
        $("#pe-result").textContent = money(result);
        $("#pe-difference").textContent = `${difference > 0 ? "+" : ""}${money(difference)}`;

        $("#pe-base").className = base.cashflow >= 0 ? "pe-positive" : "pe-negative";
        $("#pe-result").className = result >= 0 ? "pe-positive" : "pe-negative";
        $("#pe-difference").className = difference >= 0 ? "pe-positive" : "pe-negative";

        message.textContent = result < 0
            ? "This scenario produces a negative estimated monthly cash flow."
            : "This scenario remains cash-flow positive before costs not included in the form.";
    }

    function init() {
        if (!$("#dossier-immo")) return;
        installInterface();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
