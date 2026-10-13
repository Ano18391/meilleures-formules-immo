(() => {
    "use strict";

    const byId = id => document.getElementById(id);
    const money = value => new Intl.NumberFormat("en-GB", {
        style: "currency", currency: "EUR", maximumFractionDigits: 0
    }).format(Number.isFinite(value) ? value : 0);
    const percent = value => `${(Number.isFinite(value) ? value : 0).toFixed(1)}%`;
    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

    function monthlyPayment(principal, annualRate, years) {
        if (!(principal > 0) || !(years > 0)) return 0;
        const months = years * 12;
        const rate = annualRate / 100 / 12;
        if (rate === 0) return principal / months;
        const factor = Math.pow(1 + rate, months);
        return principal * (rate * factor) / (factor - 1);
    }

    function getValues() {
        const ids = ["purchase-price", "acquisition-fees", "renovation-cost", "monthly-rent", "monthly-charges", "monthly-tax", "loan-amount", "interest-rate", "loan-years"];
        const values = {};
        for (const id of ids) {
            const field = byId(id);
            if (!field) return null;
            values[id] = Number(field.value);
            if (field.value.trim() === "" || !Number.isFinite(values[id]) || values[id] < 0) return null;
        }
        if (values["purchase-price"] <= 0 || values["loan-years"] <= 0) return null;
        return values;
    }

    function ensureCard() {
        if (byId("investment-score-card")) return byId("investment-score-card");
        const results = document.querySelector("#dossier-immo .dossier-results");
        if (!results) return null;
        const panel = results.closest(".dossier-panel");
        if (!panel) return null;
        const card = document.createElement("section");
        card.id = "investment-score-card";
        card.className = "investment-score-card";
        card.setAttribute("aria-live", "polite");
        card.innerHTML = `
            <div class="investment-score-heading">
                <div><p class="investment-score-kicker">PROPERTY ANALYTICS</p><h3>Investment Score</h3></div>
                <span class="investment-score-badge">BETA</span>
            </div>
            <p class="investment-score-empty" id="investment-score-empty">Complete the property figures to calculate your indicative score.</p>
            <div id="investment-score-content" hidden>
                <div class="investment-score-main">
                    <div class="investment-score-gauge" id="investment-score-gauge" style="--score-percent:0"><div class="investment-score-number"><span id="investment-score-number">—</span><small>OUT OF 100</small></div></div>
                    <div><p class="investment-score-status" id="investment-score-status">Waiting for figures</p><p class="investment-score-summary" id="investment-score-summary">Your score updates as you edit the project.</p></div>
                </div>
                <div class="investment-score-breakdown" id="investment-score-breakdown"></div>
                <div class="investment-score-insights" id="investment-score-insights"></div>
            </div>
            <p class="investment-score-disclaimer">Indicative screening tool, not financial advice. The score uses only the figures entered here and does not include every risk, tax rule, vacancy period or local market factor.</p>
        `;
        results.insertAdjacentElement("afterend", card);
        return card;
    }

    function compute(v) {
        const price = v["purchase-price"];
        const totalCost = price + v["acquisition-fees"] + v["renovation-cost"];
        const rent = v["monthly-rent"];
        const costs = v["monthly-charges"] + v["monthly-tax"];
        const loan = v["loan-amount"];
        const payment = monthlyPayment(loan, v["interest-rate"], v["loan-years"]);
        const gross = rent * 12 / price * 100;
        const net = (rent - costs) * 12 / Math.max(totalCost, 1) * 100;
        const cashflow = rent - costs - payment;
        const loanRatio = loan / Math.max(totalCost, 1);

        let grossPts = gross < 2 ? 2 : gross < 3 ? 7 : gross < 4 ? 12 : gross < 5 ? 17 : gross < 7 ? 22 : 25;
        let netPts = net < 0 ? 0 : net < 1 ? 4 : net < 2 ? 9 : net < 3 ? 14 : net < 4 ? 19 : net < 5 ? 22 : 25;
        let cashPts = cashflow < -300 ? 0 : cashflow < -100 ? 5 : cashflow < 0 ? 10 : cashflow < 100 ? 18 : cashflow < 250 ? 25 : 30;
        let financePts = loanRatio > 1.05 ? 0 : loanRatio > 0.95 ? 5 : loanRatio > 0.85 ? 9 : loanRatio > 0.7 ? 13 : loanRatio > 0.5 ? 17 : 20;
        if (loan === 0) financePts = 20;
        const score = clamp(Math.round(grossPts + netPts + cashPts + financePts), 0, 100);

        const insights = [];
        if (cashflow < 0) insights.push({mark:"!", title:"Negative cash flow", text:`Estimated shortfall of ${money(Math.abs(cashflow))} per month. Review the purchase price, rent or financing.`});
        else if (cashflow >= 150) insights.push({mark:"✓", title:"Positive monthly cash flow", text:`Approximately ${money(cashflow)} remains per month before unentered costs and unexpected expenses.`});
        else insights.push({mark:"•", title:"Limited cash-flow buffer", text:"The monthly surplus is modest. A vacancy or unexpected repair could turn it negative."});
        if (gross < 4) insights.push({mark:"!", title:"Modest gross yield", text:"Compare the yield with local market conditions and the full ownership costs."});
        else if (gross >= 7) insights.push({mark:"✓", title:"Strong gross yield", text:"Verify that the rent estimate is realistic and that the property does not require major unbudgeted works."});
        if (loanRatio > 0.9) insights.push({mark:"!", title:"High financing ratio", text:"The loan represents more than 90% of the entered total project cost, leaving a smaller equity buffer."});
        else if (loanRatio <= 0.7) insights.push({mark:"✓", title:"More equity in the project", text:"The entered loan is at or below 70% of the total project cost."});
        if (net < 0) insights.push({mark:"!", title:"Negative operating return", text:"The entered rent does not cover the monthly charges and taxes before financing."});

        let status, summary, accent;
        if (score >= 80) { status = "Strong indicative profile"; summary = "The entered figures show several positive signals. Check the assumptions before making a decision."; accent = "#35a66a"; }
        else if (score >= 65) { status = "Promising profile"; summary = "The project has encouraging indicators, with some points still worth checking."; accent = "#70ad72"; }
        else if (score >= 45) { status = "Mixed profile"; summary = "The project combines strengths and weaknesses. Review the breakdown before proceeding."; accent = "#d7a443"; }
        else { status = "Needs careful review"; summary = "Several indicators look weak based on the figures entered. Revisit the assumptions and financing."; accent = "#d46d60"; }

        const rows = [
            {label:"Gross rental yield", value:percent(gross), points:grossPts, max:25},
            {label:"Net operating yield", value:percent(net), points:netPts, max:25},
            {label:"Monthly cash flow", value:money(cashflow), points:cashPts, max:30},
            {label:"Financing ratio", value:percent(loanRatio * 100), points:financePts, max:20}
        ];
        return {score, status, summary, accent, rows, insights, gross, net, cashflow, payment, totalCost};
    }

    function render() {
        const card = ensureCard();
        if (!card) return;
        const v = getValues();
        const empty = byId("investment-score-empty");
        const content = byId("investment-score-content");
        if (!v) {
            empty.hidden = false;
            content.hidden = true;
            empty.textContent = "Enter valid values in the property form to calculate your score. Use a purchase price greater than zero and a loan term greater than zero.";
            return;
        }
        const result = compute(v);
        empty.hidden = true;
        content.hidden = false;
        card.style.setProperty("--score-accent", result.accent);
        byId("investment-score-gauge").style.setProperty("--score-percent", result.score);
        byId("investment-score-number").textContent = result.score;
        byId("investment-score-status").textContent = result.status;
        byId("investment-score-summary").textContent = result.summary;
        byId("investment-score-breakdown").innerHTML = result.rows.map(row => `
            <div class="investment-score-row">
                <span class="investment-score-row-label">${row.label}</span>
                <span class="investment-score-row-value">${row.value} · ${row.points}/${row.max}</span>
                <div class="investment-score-track"><span style="width:${Math.round(row.points / row.max * 100)}%"></span></div>
            </div>`).join("");
        byId("investment-score-insights").innerHTML = result.insights.slice(0, 4).map(item => `
            <div class="investment-score-insight"><span class="investment-score-insight-mark" aria-hidden="true">${item.mark}</span><span><b>${item.title}.</b> ${item.text}</span></div>`).join("");
    }

    function init() {
        const form = byId("dossier-form");
        if (!form) return;
        ensureCard();
        form.addEventListener("input", render);
        form.addEventListener("change", render);
        render();
        // The dossier editor can be re-opened or re-rendered; ensure the score card is restored if needed.
        const observer = new MutationObserver(() => {
            if (!byId("investment-score-card")) {
                ensureCard();
                render();
            }
        });
        const dossier = byId("dossier-immo");
        if (dossier) observer.observe(dossier, {childList:true, subtree:true});
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, {once:true});
    else init();
})();
