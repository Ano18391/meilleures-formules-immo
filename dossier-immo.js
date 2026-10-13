(() => {
    "use strict";

    const API = "https://property-formulas-api.vercel.app/api";
    const $ = (selector, root = document) => root.querySelector(selector);
    const euro = value => new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0
    }).format(Number.isFinite(value) ? value : 0);

    const number = id => {
        const value = String($("#" + id)?.value ?? "").trim().replace(/\s/g, "").replace(",", ".");
        return value === "" ? 0 : Number(value);
    };

    const validNumber = id => {
        const el = $("#" + id);
        if (!el) return false;
        const value = number(id);
        return Number.isFinite(value) && value >= 0 && el.value.trim() !== "";
    };

    let currentId = null;
    let signedIn = false;
    let dossiers = [];

    async function request(path, options = {}) {
        const response = await fetch(`${API}/${path}`, {
            ...options,
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            }
        });

        let data = {};
        try {
            data = await response.json();
        } catch {
            throw new Error("Réponse invalide du serveur.");
        }

        if (!response.ok) {
            throw new Error(data.error || `Erreur serveur (${response.status}).`);
        }

        return data;
    }

    function message(text, type = "") {
        const el = $("#dossier-message");
        el.textContent = text;
        el.className = "dossier-message" + (type ? ` ${type}` : "");
        el.hidden = !text;
    }

    function getData() {
        const fields = [
            "property-address", "purchase-price", "acquisition-fees",
            "renovation-cost", "monthly-rent", "monthly-charges",
            "monthly-tax", "loan-amount", "interest-rate", "loan-years"
        ];

        const data = {};
        for (const id of fields) {
            const el = $("#" + id);
            data[id] = el.value.trim();
        }
        return data;
    }

    function calculate(data = getData()) {
        const value = id => {
            const raw = String(data[id] ?? "0").trim().replace(/\s/g, "").replace(",", ".");
            const result = Number(raw);
            return Number.isFinite(result) && result >= 0 ? result : 0;
        };

        const price = value("purchase-price");
        const fees = value("acquisition-fees");
        const works = value("renovation-cost");
        const rent = value("monthly-rent");
        const charges = value("monthly-charges");
        const tax = value("monthly-tax");
        const loan = value("loan-amount");
        const rate = value("interest-rate") / 100;
        const years = value("loan-years");

        const investment = price + fees + works;
        const grossAnnual = rent * 12;
        const netAnnual = grossAnnual - (charges + tax) * 12;
        const grossYield = price > 0 ? grossAnnual / price * 100 : 0;
        const netYield = investment > 0 ? netAnnual / investment * 100 : 0;

        let payment = 0;
        const months = Math.round(years * 12);

        if (loan > 0 && months > 0) {
            const monthlyRate = rate / 12;
            payment = monthlyRate === 0
                ? loan / months
                : loan * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months));
        }

        const cashflow = rent - charges - tax - payment;

        $("#dossier-investment").textContent = euro(investment);
        $("#dossier-gross").textContent = price > 0 ? grossYield.toFixed(2).replace(".", ",") + " %" : "—";
        $("#dossier-net").textContent = investment > 0 ? netYield.toFixed(2).replace(".", ",") + " %" : "—";
        $("#dossier-payment").textContent = euro(payment);
        $("#dossier-cashflow").textContent = euro(cashflow);
        $("#dossier-cashflow").classList.toggle("negative", cashflow < 0);
        $("#dossier-cashflow").classList.toggle("positive", cashflow >= 0);

        return { investment, grossYield, netYield, payment, cashflow };
    }

    function renderList() {
        const list = $("#dossier-list");
        list.replaceChildren();

        if (!dossiers.length) {
            const empty = document.createElement("p");
            empty.className = "dossier-empty";
            empty.textContent = "Aucun dossier enregistré pour le moment.";
            list.append(empty);
            return;
        }

        for (const dossier of dossiers) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "dossier-list-item";
            button.dataset.dossierId = dossier.id;

            const title = document.createElement("strong");
            title.textContent = dossier.title;

            const details = document.createElement("span");
            const data = dossier.property_data || {};
            const price = Number(String(data["purchase-price"] || "0").replace(",", "."));
            details.textContent = euro(price) + " · " + (data["property-address"] || "No address provided");

            button.append(title, details);
            list.append(button);
        }
    }

    function displayValue(value) {
        return value === undefined || value === null || String(value).trim() === ""
            ? "—"
            : String(value);
    }

    function displayMoney(value) {
        const n = Number(String(value ?? "0").trim().replace(/\\s/g, "").replace(",", "."));
        return euro(Number.isFinite(n) ? n : 0);
    }

    function showDossierView(dossier) {
        const data = dossier.property_data || {};
        const value = id => {
            const n = Number(String(data[id] ?? "0").trim().replace(/\\s/g, "").replace(",", "."));
            return Number.isFinite(n) && n >= 0 ? n : 0;
        };

        const result = calculate(data);
        const set = (id, text) => {
            const el = $("#" + id);
            if (el) el.textContent = text;
        };

        set("dossier-view-title", dossier.title || "REAL ESTATE ANALYSIS");
        set("dossier-view-address", displayValue(data["property-address"] || "No address provided"));
        set("view-purchase-price", displayMoney(value("purchase-price")));
        set("view-investment", euro(result.investment));
        set("view-gross", value("purchase-price") > 0 ? result.grossYield.toFixed(2).replace(".", ",") + " %" : "—");
        set("view-net", result.investment > 0 ? result.netYield.toFixed(2).replace(".", ",") + " %" : "—");
        set("view-payment", euro(result.payment));
        set("view-cashflow", euro(result.cashflow));
        set("view-detail-price", displayMoney(value("purchase-price")));
        set("view-fees", displayMoney(value("acquisition-fees")));
        set("view-works", displayMoney(value("renovation-cost")));
        set("view-total", euro(result.investment));
        set("view-rent", displayMoney(value("monthly-rent")));
        set("view-charges", displayMoney(value("monthly-charges")));
        set("view-tax", displayMoney(value("monthly-tax")));
        set("view-income", euro(value("monthly-rent") - value("monthly-charges") - value("monthly-tax")));
        set("view-loan", displayMoney(value("loan-amount")));
        set("view-rate", displayValue(data["interest-rate"]) + " %");
        set("view-years", displayValue(data["loan-years"]) + " ans");

        const cashflow = $("#view-cashflow");
        if (cashflow) {
            cashflow.classList.toggle("positive", result.cashflow >= 0);
            cashflow.classList.toggle("negative", result.cashflow < 0);
        }

        $("#dossier-view").hidden = false;
        $("#dossier-editor").hidden = true;
    }

    function showEditor() {
        $("#dossier-view").hidden = true;
        $("#dossier-editor").hidden = false;
        $("#dossier-editor-heading").textContent = currentId
            ? "Edit property details"
            : "New property details";
        $("#dossier-form").scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function fillForm(dossier) {
        const data = dossier.property_data || {};
        currentId = dossier.id;
        const deleteButton = $("#dossier-delete");
        if (deleteButton) deleteButton.hidden = false;

        $("#dossier-title").value = dossier.title || "";
        for (const [id, value] of Object.entries(data)) {
            const el = $("#" + id);
            if (el) el.value = String(value ?? "");
        }

        calculate(data);
        showDossierView(dossier);
        message("Property loaded.", "success");
        $("#dossier-view").scrollIntoView({ behavior: "smooth", block: "start" });
    }

    async function loadDossiers() {
        const result = await request("properties", { method: "GET" });
        dossiers = Array.isArray(result.dossiers) ? result.dossiers : [];
        renderList();
    }

    let logoutInProgress = false;

    async function refreshAccess() {
        if (logoutInProgress) return;

        try {
            const data = await request("me", { method: "GET" });
            if (logoutInProgress) return;
            signedIn = Boolean(data.user);
        } catch {
            if (logoutInProgress) return;
            signedIn = false;
        }

        $("#dossier-locked").hidden = signedIn;
        $("#dossier-workspace").hidden = !signedIn;

        if (signedIn) {
            try {
                await loadDossiers();
                message("");
            } catch (error) {
                message(error.message + " Vérifiez que les routes du backend sont déployées.", "error");
            }
        } else {
            dossiers = [];
            renderList();
            message("Connectez-vous à votre compte Property Formulas pour créer et sauvegarder vos dossiers.");
        }
    }

    window.addEventListener("property-formulas:logout", () => {
        logoutInProgress = true;
        signedIn = false;
        dossiers = [];
        currentId = null;

        const locked = $("#dossier-locked");
        const workspace = $("#dossier-workspace");
        const form = $("#dossier-form");
        const view = $("#dossier-view");
        const editor = $("#dossier-editor");
        const deleteButton = $("#dossier-delete");

        if (locked) locked.hidden = false;
        if (workspace) workspace.hidden = true;
        if (form) form.reset();
        if (view) view.hidden = true;
        if (editor) editor.hidden = false;
        if (deleteButton) deleteButton.hidden = true;

        renderList();
        message("Connectez-vous à votre compte Property Formulas pour retrouver vos dossiers.");
    });

    window.addEventListener("property-formulas:login", () => {
        logoutInProgress = false;
        refreshAccess();
    });

    function resetForm() {
        currentId = null;
        const deleteButton = $("#dossier-delete");
        if (deleteButton) deleteButton.hidden = true;
        $("#dossier-form").reset();
        calculate();
        $("#dossier-view").hidden = true;
        $("#dossier-editor").hidden = false;
        $("#dossier-editor-heading").textContent = "New property details";
        message("New Property ready.");
        $("#dossier-form").scrollIntoView({ behavior: "smooth", block: "start" });
    }


    function exportPropertyReport() {
        const view = $("#dossier-view");

        if (!view || view.hidden) {
            alert("Open a saved property analysis before exporting the report.");
            return;
        }

        const get = id => {
            const element = $("#" + id);
            return element ? element.textContent.trim() || "—" : "—";
        };

        const esc = value => String(value ?? "—").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);

        const title = get("dossier-view-title");
        const address = get("dossier-view-address");
        const date = new Intl.DateTimeFormat("en-US", {
            year: "numeric", month: "long", day: "numeric"
        }).format(new Date());

        const metric = (label, value, detail = "") => `
            <div class="metric">
                <div class="metric-label">${esc(label)}</div>
                <div class="metric-value">${esc(value)}</div>
                ${detail ? `<div class="metric-detail">${esc(detail)}</div>` : ""}
            </div>`;

        const table = rows => `
            <table>
                <tbody>
                    ${rows.map(([label, value, emphasis = false]) => `
                        <tr class="${emphasis ? "emphasis" : ""}">
                            <th scope="row">${esc(label)}</th>
                            <td>${esc(value)}</td>
                        </tr>`).join("")}
                </tbody>
            </table>`;

        const page = window.open("", "_blank");

        if (!page) {
            alert("Your browser blocked the report window. Allow pop-ups for this website and try again.");
            return;
        }

        const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Real Estate Investment Report</title>
<style>
    :root {
        color-scheme: light;
        --ink: #182c25;
        --muted: #69776f;
        --green: #286348;
        --green-dark: #173f30;
        --line: #dce5df;
        --pale: #f1f6f2;
        --paper: #ffffff;
    }

    * { box-sizing: border-box; }

    html, body {
        margin: 0;
        padding: 0;
        background: #e9eeeb;
        color: var(--ink);
        font-family: Arial, Helvetica, sans-serif;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }

    .toolbar {
        position: sticky;
        top: 0;
        z-index: 10;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 12px;
        padding: 14px;
        background: #173f30;
        color: white;
    }

    .toolbar button {
        border: 1px solid rgba(255,255,255,.35);
        border-radius: 8px;
        padding: 11px 18px;
        background: white;
        color: #173f30;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
    }

    .toolbar .secondary {
        background: transparent;
        color: white;
    }

    .page {
        position: relative;
        width: 210mm;
        height: 297mm;
        margin: 18px auto;
        padding: 15mm 16mm 13mm;
        overflow: hidden;
        background: var(--paper);
        box-shadow: 0 8px 32px rgba(20,45,32,.12);
    }

    .brandline {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 10px;
        border-bottom: 2px solid var(--green);
        color: var(--green);
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 1.6px;
        text-transform: uppercase;
    }

    .report-code {
        color: var(--muted);
        font-weight: 600;
        letter-spacing: .4px;
    }

    .hero {
        padding: 24px 0 20px;
    }

    .eyebrow {
        margin: 0 0 9px;
        color: var(--green);
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 2px;
        text-transform: uppercase;
    }

    h1 {
        margin: 0;
        max-width: 155mm;
        font-family: Georgia, "Times New Roman", serif;
        font-size: 29px;
        font-weight: 500;
        letter-spacing: -.8px;
        line-height: 1.15;
        overflow-wrap: anywhere;
    }

    .address {
        margin: 10px 0 0;
        color: var(--muted);
        font-size: 11px;
        line-height: 1.5;
        overflow-wrap: anywhere;
    }

    .date-line {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        margin-top: 17px;
        padding-top: 10px;
        border-top: 1px solid var(--line);
        color: var(--muted);
        font-size: 9px;
    }

    .section {
        margin-top: 18px;
        break-inside: avoid;
    }

    .section-heading {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 0 0 10px;
        color: var(--ink);
        font-size: 12px;
        font-weight: 800;
    }

    .section-heading:before {
        width: 3px;
        height: 16px;
        flex: 0 0 3px;
        background: var(--green);
        content: "";
    }

    .metrics {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
    }

    .metric {
        min-height: 69px;
        padding: 12px 13px;
        border: 1px solid var(--line);
        border-radius: 5px;
        background: #fff;
    }

    .metric.primary {
        border-color: #cbded1;
        background: var(--pale);
    }

    .metric-label {
        color: var(--muted);
        font-size: 9px;
        font-weight: 700;
        line-height: 1.4;
    }

    .metric-value {
        margin-top: 7px;
        color: var(--ink);
        font-family: Georgia, "Times New Roman", serif;
        font-size: 21px;
        font-weight: 600;
        letter-spacing: -.4px;
        overflow-wrap: anywhere;
    }

    .metric-detail {
        margin-top: 4px;
        color: var(--muted);
        font-size: 8px;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        font-size: 10px;
    }

    tr { border-bottom: 1px solid var(--line); }

    th, td {
        padding: 9px 10px;
        line-height: 1.35;
    }

    th {
        width: 62%;
        color: var(--muted);
        font-weight: 500;
        text-align: left;
    }

    td {
        color: var(--ink);
        font-weight: 700;
        text-align: right;
        overflow-wrap: anywhere;
    }

    tr.emphasis { background: var(--pale); }
    tr.emphasis th, tr.emphasis td { color: var(--green-dark); }

    .two-columns {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
    }

    .callout {
        margin-top: 17px;
        padding: 13px 15px;
        border-left: 3px solid var(--green);
        background: var(--pale);
        color: #40554a;
        font-size: 9px;
        line-height: 1.6;
    }

    .callout strong {
        display: block;
        margin-bottom: 4px;
        color: var(--green-dark);
        font-size: 10px;
    }

    .footer {
        position: absolute;
        right: 16mm;
        bottom: 9mm;
        left: 16mm;
        display: flex;
        justify-content: space-between;
        gap: 10px;
        padding-top: 8px;
        border-top: 1px solid var(--line);
        color: var(--muted);
        font-size: 8px;
    }

    .footer span:last-child {
        color: var(--green);
        font-weight: 700;
        letter-spacing: .5px;
    }

    .page-two-title {
        margin: 23px 0 6px;
        font-family: Georgia, "Times New Roman", serif;
        font-size: 25px;
        font-weight: 500;
    }

    .page-intro {
        margin: 0 0 19px;
        color: var(--muted);
        font-size: 10px;
        line-height: 1.6;
    }

    .small-note {
        margin-top: 14px;
        color: var(--muted);
        font-size: 8.5px;
        line-height: 1.65;
    }

    @page {
        size: A4;
        margin: 0;
    }

    @media print {
        html, body {
            width: 210mm;
            margin: 0;
            background: white;
        }

        .toolbar { display: none !important; }

        .page {
            width: 210mm;
            height: 297mm;
            margin: 0;
            box-shadow: none;
            break-after: page;
            page-break-after: always;
        }

        .page:last-of-type {
            break-after: auto;
            page-break-after: auto;
        }
    }

    @media screen and (max-width: 800px) {
        .page {
            width: 100%;
            height: auto;
            min-height: 297mm;
            padding: 28px 22px 55px;
        }

        .footer { right: 22px; left: 22px; }
        .two-columns { grid-template-columns: 1fr; }
    }
</style>
</head>
<body>
    <div class="toolbar">
        <button type="button" onclick="window.print()">Print / Save as PDF</button>
        <button type="button" class="secondary" onclick="window.close()">Close report</button>
    </div>

    <main>
        <article class="page">
            <div class="brandline">
                <span>Real Estate Investment</span>
                <span class="report-code">Investment report</span>
            </div>

            <header class="hero">
                <p class="eyebrow">Property analysis · Executive summary</p>
                <h1>${esc(title)}</h1>
                <p class="address">${esc(address)}</p>
                <div class="date-line">
                    <span>PREPARED ${esc(date.toUpperCase())}</span>
                    <span>CONFIDENTIAL · FOR REVIEW</span>
                </div>
            </header>

            <section class="section">
                <h2 class="section-heading">Investment at a glance</h2>
                <div class="metrics">
                    ${metric("Purchase price", get("view-purchase-price"))}
                    ${metric("Total project cost", get("view-investment"), "Purchase, closing costs and renovation")}
                    ${metric("Gross rental yield", get("view-gross"), "Based on purchase price")}
                    ${metric("Estimated net yield", get("view-net"), "Based on total project cost")}
                </div>
            </section>

            <section class="section">
                <h2 class="section-heading">Acquisition budget</h2>
                ${table([
                    ["Purchase price", get("view-detail-price")],
                    ["Closing costs", get("view-fees")],
                    ["Renovation costs", get("view-works")],
                    ["Total project cost", get("view-total"), true]
                ])}
            </section>

            <section class="section">
                <h2 class="section-heading">Rental performance</h2>
                <div class="metrics">
                    ${metric("Monthly rental income", get("view-rent"))}
                    ${metric("Monthly cash flow", get("view-cashflow"), "After listed costs and estimated loan payment")}
                </div>
                <div style="margin-top:10px">
                    ${table([
                        ["Monthly operating charges entered", get("view-charges")],
                        ["Monthly property taxes entered", get("view-tax")],
                        ["Annual income after listed charges and taxes", get("view-income"), true]
                    ])}
                </div>
            </section>

            <div class="callout">
                <strong>Executive reading</strong>
                Review the total project cost alongside the rental yield and monthly cash flow.
                These indicators answer different questions: return on investment, income after
                entered costs, and estimated monthly cash remaining after the loan payment.
            </div>

            <footer class="footer">
                <span>Prepared from the figures entered in the analysis</span>
                <span>01 / 02</span>
            </footer>
        </article>

        <article class="page">
            <div class="brandline">
                <span>Real Estate Investment</span>
                <span class="report-code">Financial detail</span>
            </div>

            <h2 class="page-two-title">Financing &amp; assumptions</h2>
            <p class="page-intro">
                A structured view of the financing figures and recurring costs entered
                for this investment scenario.
            </p>

            <section class="section">
                <h2 class="section-heading">Financing structure</h2>
                ${table([
                    ["Mortgage amount", get("view-loan")],
                    ["Mortgage interest rate", get("view-rate")],
                    ["Mortgage term", get("view-years")],
                    ["Estimated monthly payment", get("view-payment"), true]
                ])}
            </section>

            <section class="section">
                <h2 class="section-heading">Key performance indicators</h2>
                <div class="metrics">
                    ${metric("Gross rental yield", get("view-gross"))}
                    ${metric("Estimated net yield", get("view-net"))}
                    ${metric("Monthly rental income", get("view-rent"))}
                    ${metric("Estimated monthly cash flow", get("view-cashflow"))}
                </div>
            </section>

            <section class="section">
                <h2 class="section-heading">How to read this analysis</h2>
                ${table([
                    ["Gross rental yield", "Annual rent ÷ purchase price"],
                    ["Estimated net yield", "Annual rent less entered monthly charges and taxes, annualized, ÷ total project cost"],
                    ["Monthly cash flow", "Monthly rent less entered charges, taxes and estimated loan payment"]
                ])}
            </section>

            <div class="callout">
                <strong>Important assumptions &amp; limitations</strong>
                Results depend on the figures supplied and are estimates, not a guarantee
                of investment performance. The net-yield calculation only deducts the
                monthly charges and taxes entered in this tool. It may not include vacancy,
                insurance, maintenance, management fees, accounting costs, financing costs
                beyond the modeled payment, or other applicable expenses. Confirm all figures
                and local tax treatment before making an investment decision.
            </div>

            <p class="small-note">
                This report is intended for preliminary analysis and discussion. It is not
                a property valuation, a mortgage offer, tax advice, or a promise of future returns.
                Financing terms, rental income and expenses should be independently verified.
            </p>

            <footer class="footer">
                <span>${esc(title)} · ${esc(address)}</span>
                <span>02 / 02</span>
            </footer>
        </article>
    </main>
</body>
</html>`;

        page.document.open();
        page.document.write(html);
        page.document.close();
        page.focus();

        page.addEventListener("load", () => {
            page.setTimeout(() => page.print(), 500);
        }, { once: true });
    }


    function init() {
        const section = $("#dossier-immo");
        if (!section) return;

        const form = $("#dossier-form");

        form.addEventListener("input", () => calculate());

        $("#dossier-new").addEventListener("click", resetForm);
        $("#dossier-view-new").addEventListener("click", resetForm);
        $("#dossier-edit").addEventListener("click", showEditor);

        const pdfButton = $("#dossier-export-pdf");
        if (pdfButton) {
            pdfButton.addEventListener("click", exportPropertyReport);
        }


        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.id = "dossier-delete";
        deleteButton.className = "dossier-delete";
        deleteButton.textContent = "Supprimer ce dossier";
        deleteButton.hidden = true;
        $("#dossier-save").parentElement.append(deleteButton);

        $("#dossier-view-delete").addEventListener("click", () => deleteButton.click());

        deleteButton.addEventListener("click", async () => {
            if (!currentId || !signedIn) {
                message("Chargez d'abord un dossier enregistré.", "error");
                return;
            }

            const dossier = dossiers.find(item => item.id === currentId);
            const title = dossier?.title || $("#dossier-title").value.trim() || "ce dossier";

            if (!window.confirm(`Voulez-vous vraiment supprimer « ${title} » ? Cette action est définitive.`)) {
                return;
            }

            deleteButton.disabled = true;
            deleteButton.textContent = "Suppression…";

            try {
                await request(`properties/delete?id=${encodeURIComponent(currentId)}`, {
                    method: "DELETE"
                });

                currentId = null;
                $("#dossier-form").reset();
                calculate();
                $("#dossier-view").hidden = true;
                $("#dossier-editor").hidden = false;
                $("#dossier-editor-heading").textContent = "New property details";
                await loadDossiers();
                message("Dossier supprimé définitivement.", "success");
            } catch (error) {
                message(error.message, "error");
            } finally {
                deleteButton.disabled = false;
                deleteButton.textContent = "Supprimer ce dossier";
                deleteButton.hidden = !currentId;
            }
        });

        $("#dossier-login").addEventListener("click", () => {
            const account = $("#account-section");
            if (account) {
                account.hidden = false;
                account.scrollIntoView({ behavior: "smooth", block: "start" });
                $("#account-open")?.click();
            } else {
                message("Ouvrez votre espace compte depuis la navigation.", "error");
            }
        });

        $("#dossier-list").addEventListener("click", event => {
            const button = event.target.closest("[data-dossier-id]");
            if (!button) return;
            const dossier = dossiers.find(item => item.id === button.dataset.dossierId);
            if (dossier) fillForm(dossier);
        });

        $("#dossier-refresh").addEventListener("click", refreshAccess);

        form.addEventListener("submit", async event => {
            event.preventDefault();
            message("");

            if (!signedIn) {
                message("Connectez-vous avant d'enregistrer.", "error");
                return;
            }

            if (!form.reportValidity()) return;

            const numericFields = [
                "purchase-price", "acquisition-fees", "renovation-cost",
                "monthly-rent", "monthly-charges", "monthly-tax",
                "loan-amount", "interest-rate", "loan-years"
            ];

            for (const id of numericFields) {
                if (!validNumber(id)) {
                    message("Vérifiez les montants, le taux et la durée du prêt.", "error");
                    return;
                }
            }

            const title = $("#dossier-title").value.trim();
            if (!title || title.length > 120) {
                message("Le titre doit contenir entre 1 et 120 caractères.", "error");
                return;
            }

            const button = $("#dossier-save");
            button.disabled = true;
            button.textContent = "Enregistrement…";

            try {
                const body = {
                    title,
                    propertyData: getData()
                };
                if (currentId) body.id = currentId;

                const result = await request("properties/save", {
                    method: "POST",
                    body: JSON.stringify(body)
                });

                const saved = result.dossier;
                if (!saved) throw new Error("Le serveur n'a pas confirmé l'enregistrement.");

                currentId = saved.id;
                await loadDossiers();
                showDossierView(saved);
                message("Dossier enregistré dans votre espace.", "success");
            } catch (error) {
                message(error.message, "error");
            } finally {
                button.disabled = false;
                button.textContent = "Enregistrer le dossier";
            }
        });

        $("#dossier-new").click();
        refreshAccess();

        // Rafraîchit l'accès quand l'utilisateur revient sur cet onglet.
        document.addEventListener("visibilitychange", () => {
            if (!document.hidden && !section.hidden) refreshAccess();
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
