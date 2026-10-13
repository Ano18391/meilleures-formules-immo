(() => {
    "use strict";

    const guide = `
    <div class="pfg-page">
      <header class="pfg-hero">
        <div class="pfg-eyebrow"><span></span> PROPERTY INVESTMENT PLAYBOOK</div>
        <h1>Build Wealth Through <em>Real Estate.</em></h1>
        <p class="pfg-intro">A practical, numbers-first guide to finding, evaluating, financing and managing investment properties — from your first analysis to a scalable portfolio.</p>
        <div class="pfg-hero-stats">
          <div><strong>01–12</strong><span>Investment stages</span></div>
          <div><strong>DATA FIRST</strong><span>Decisions over emotion</span></div>
          <div><strong>LONG TERM</strong><span>Wealth-building mindset</span></div>
        </div>
        <button class="pfg-cta" type="button" onclick="document.getElementById('pfg-step-1')?.scrollIntoView({behavior:'smooth',block:'start'})">Explore the roadmap <span>↓</span></button>
      </header>

      <div class="pfg-layout">
        <aside class="pfg-toc">
          <p>YOUR ROADMAP</p>
          <a href="#pfg-step-1">01 · Define your strategy</a>
          <a href="#pfg-step-2">02 · Understand the market</a>
          <a href="#pfg-step-3">03 · Set your budget</a>
          <a href="#pfg-step-4">04 · Find opportunities</a>
          <a href="#pfg-step-5">05 · Analyse the numbers</a>
          <a href="#pfg-step-6">06 · Secure financing</a>
          <a href="#pfg-step-7">07 · Due diligence</a>
          <a href="#pfg-step-8">08 · Understand taxes</a>
          <a href="#pfg-step-9">09 · Negotiate</a>
          <a href="#pfg-step-10">10 · Complete the purchase</a>
          <a href="#pfg-step-11">11 · Manage the property</a>
          <a href="#pfg-step-12">12 · Scale or exit</a>
        </aside>

        <div class="pfg-content">
          <section class="pfg-callout">
            <strong>The core principle</strong>
            <p>A property is not a good investment simply because it looks attractive. The purchase price, financing, realistic rental income, operating costs and risks must work together.</p>
          </section>

          <section class="pfg-step" id="pfg-step-1">
            <div class="pfg-number">01</div><div>
              <p class="pfg-label">FOUNDATION</p><h2>Define your investment strategy</h2>
              <p>Decide what you want the property to achieve before looking at listings. Different strategies require different budgets, skills and levels of involvement.</p>
              <div class="pfg-cards">
                <article><h3>Cash flow</h3><p>Prioritise sustainable rental income after recurring expenses and financing.</p></article>
                <article><h3>Capital growth</h3><p>Target areas with credible long-term demand and potential for value appreciation.</p></article>
                <article><h3>Value-add</h3><p>Improve an underperforming property through renovation or better management.</p></article>
              </div>
              <p class="pfg-tip">Action: write down your target return, investment horizon, available cash and acceptable risk before proceeding.</p>
            </div>
          </section>

          <section class="pfg-step" id="pfg-step-2">
            <div class="pfg-number">02</div><div>
              <p class="pfg-label">MARKET RESEARCH</p><h2>Understand the local market</h2>
              <p>Study a specific neighbourhood rather than relying on national averages. Local conditions determine achievable rents, tenant demand and resale liquidity.</p>
              <ul><li>Compare recent asking prices and, where available, completed transactions.</li><li>Research comparable rents, vacancy and tenant profiles.</li><li>Check transport, employment, amenities, planned developments and local supply.</li><li>Investigate flood exposure, energy performance, building condition and local rental rules.</li></ul>
              <p class="pfg-tip">Action: analyse at least several comparable properties and record the source and date of every important figure.</p>
            </div>
          </section>

          <section class="pfg-step" id="pfg-step-3">
            <div class="pfg-number">03</div><div>
              <p class="pfg-label">CAPITAL PLANNING</p><h2>Set a realistic total budget</h2>
              <p>The purchase price is only one part of the initial investment. Include acquisition costs, renovation, furnishing where applicable, financing fees and a reserve for unexpected expenses.</p>
              <ul><li>Separate available cash from emergency savings.</li><li>Estimate the initial cash contribution and monthly obligations.</li><li>Obtain contractor estimates before committing to major works.</li><li>Keep a contingency reserve instead of allocating every euro to the purchase.</li></ul>
              <p class="pfg-tip">Action: model a base case and a downside case before making an offer.</p>
            </div>
          </section>

          <section class="pfg-step" id="pfg-step-4">
            <div class="pfg-number">04</div><div>
              <p class="pfg-label">DEAL SOURCING</p><h2>Find and screen opportunities</h2>
              <p>Build a repeatable process for discovering properties. A large number of listings may be unsuitable; the goal is to identify the few worth investigating in depth.</p>
              <ul><li>Set filters for location, property type, price and minimum financial performance.</li><li>Compare listings against realistic rental evidence, not optimistic advertisements.</li><li>Investigate why a property has been on the market for a long time.</li><li>Track each candidate in a spreadsheet or your property dossier.</li></ul>
              <p class="pfg-tip">Action: reject weak deals early, before spending significant time or money on them.</p>
            </div>
          </section>

          <section class="pfg-step" id="pfg-step-5">
            <div class="pfg-number">05</div><div>
              <p class="pfg-label">FINANCIAL UNDERWRITING</p><h2>Analyse the numbers before emotions take over</h2>
              <p>Use conservative assumptions and distinguish revenue, operating performance, financing and tax. These measure different aspects of an investment.</p>
              <div class="pfg-cards">
                <article><h3>Gross yield</h3><p>Annual rent divided by purchase price, expressed as a percentage.</p></article>
                <article><h3>Net operating yield</h3><p>Estimated annual rent after operating expenses, divided by total project cost. Define included expenses consistently.</p></article>
                <article><h3>Cash flow</h3><p>Rental income less expenses and debt payments. Tax and irregular costs can change the final result.</p></article>
              </div>
              <ul><li>Include maintenance, insurance, vacancy, management and applicable taxes.</li><li>Test higher interest rates, lower rents and unexpected repairs.</li><li>Separate cash flow from principal repayment and potential appreciation.</li><li>Check the result against your required return and available alternatives.</li></ul>
              <p class="pfg-tip">Action: if the deal only works under optimistic assumptions, reconsider the price or walk away.</p>
            </div>
          </section>

          <section class="pfg-step" id="pfg-step-6">
            <div class="pfg-number">06</div><div>
              <p class="pfg-label">FINANCING</p><h2>Structure financing carefully</h2>
              <p>Compare the full cost and conditions of financing, not only the advertised interest rate.</p>
              <ul><li>Request comparable offers and review the annual percentage rate where applicable.</li><li>Compare term length, fees, insurance, early repayment conditions and required equity.</li><li>Test whether the property remains affordable if income falls or costs rise.</li><li>Keep enough liquidity for repairs and periods without rent.</li></ul>
              <p class="pfg-tip">Action: do not assume a lender will approve the loan until you have a formal decision.</p>
            </div>
          </section>

          <section class="pfg-step" id="pfg-step-7">
            <div class="pfg-number">07</div><div>
              <p class="pfg-label">RISK CONTROL</p><h2>Carry out proper due diligence</h2>
              <p>Verify the property, its legal status and the assumptions behind your financial model before committing.</p>
              <ul><li>Inspect structure, roof, plumbing, electricity and visible defects.</li><li>Review title, easements, planning restrictions and relevant permits.</li><li>For a condominium, inspect meeting minutes, charges, planned works and reserve funds.</li><li>Check leases, rent history, tenant deposits and applicable tenant protections.</li><li>Verify energy performance, hazardous-material requirements and local compliance rules.</li></ul>
              <p class="pfg-tip">Action: use qualified legal, building and tax professionals when the situation warrants it.</p>
            </div>
          </section>

          <section class="pfg-step" id="pfg-step-8">
            <div class="pfg-number">08</div><div>
              <p class="pfg-label">TAX & COMPLIANCE</p><h2>Understand the rules that apply to you</h2>
              <p>Tax treatment depends on the country, ownership structure, rental arrangement and your personal circumstances. Rules can materially change the net return.</p>
              <ul><li>Identify the applicable rental-income regime and deductible expenses.</li><li>Check local licensing, registration, energy and habitability obligations.</li><li>Understand acquisition taxes, ongoing property taxes and potential capital-gains tax.</li><li>Compare ownership structures only with reliable professional guidance.</li></ul>
              <p class="pfg-tip">Action: obtain country-specific advice before signing; do not rely on generic online estimates as a final tax calculation.</p>
            </div>
          </section>

          <section class="pfg-step" id="pfg-step-9">
            <div class="pfg-number">09</div><div>
              <p class="pfg-label">NEGOTIATION</p><h2>Make an offer based on evidence</h2>
              <p>Use comparable sales, verified repair costs, financing constraints and identified risks to justify your offer.</p>
              <ul><li>Set a maximum price based on your own financial model.</li><li>Document the assumptions supporting that price.</li><li>Understand deposits, contingencies, deadlines and withdrawal conditions.</li><li>Avoid pressure to waive essential checks without understanding the consequences.</li></ul>
              <p class="pfg-tip">Action: be willing to walk away when the seller's price no longer fits your investment criteria.</p>
            </div>
          </section>

          <section class="pfg-step" id="pfg-step-10">
            <div class="pfg-number">10</div><div>
              <p class="pfg-label">ACQUISITION</p><h2>Complete the purchase methodically</h2>
              <p>Coordinate financing, legal checks, contractual deadlines, insurance and the final inspection.</p>
              <ul><li>Confirm all required funds and documents are ready.</li><li>Review the final contract with the appropriate professional.</li><li>Record meter readings, keys, condition and handover documents.</li><li>Store invoices, contracts, guarantees and financing records securely.</li></ul>
              <p class="pfg-tip">Action: prepare a closing checklist and confirm every contractual condition before completion.</p>
            </div>
          </section>

          <section class="pfg-step" id="pfg-step-11">
            <div class="pfg-number">11</div><div>
              <p class="pfg-label">OPERATIONS</p><h2>Manage the asset professionally</h2>
              <p>Long-term performance depends on more than the purchase. Good operations protect the property's condition, tenant experience and financial stability.</p>
              <ul><li>Screen tenants lawfully and document the tenancy properly.</li><li>Maintain a schedule for inspections, preventive maintenance and safety checks.</li><li>Track rent collection, arrears, expenses, vacancies and renewals.</li><li>Review actual performance against your original assumptions every month.</li><li>Maintain a dedicated reserve for repairs and future capital expenditure.</li></ul>
              <p class="pfg-tip">Action: use a property manager when the time saved and risk reduction justify the fee.</p>
            </div>
          </section>

          <section class="pfg-step" id="pfg-step-12">
            <div class="pfg-number">12</div><div>
              <p class="pfg-label">PORTFOLIO STRATEGY</p><h2>Scale, refinance or exit with a plan</h2>
              <p>Review whether each property still supports your goals. More properties do not automatically mean better returns.</p>
              <ul><li>Measure net cash flow, equity, debt exposure and maintenance needs.</li><li>Compare holding, renovating, refinancing and selling under realistic assumptions.</li><li>Stress-test the portfolio for vacancies, rate changes and concentrated local risks.</li><li>Account for transaction costs and tax before estimating sale proceeds.</li><li>Expand only when your reserves, systems and financing capacity support it.</li></ul>
              <p class="pfg-tip">Action: schedule an annual portfolio review and document the reasons for every major decision.</p>
            </div>
          </section>

          <section class="pfg-checklist">
            <p class="pfg-label">FINAL INVESTMENT CHECK</p>
            <h2>Would you buy this property today?</h2>
            <p>Use this checklist before moving forward. Tick each item only when you have verified it.</p>
            <label><input type="checkbox"> The purchase price is supported by comparable evidence.</label>
            <label><input type="checkbox"> Rent assumptions are realistic and independently checked.</label>
            <label><input type="checkbox"> All significant costs and a contingency reserve are included.</label>
            <label><input type="checkbox"> The downside scenario is financially manageable.</label>
            <label><input type="checkbox"> Legal, technical, financing and tax checks are complete.</label>
            <label><input type="checkbox"> I understand the risks and have a clear exit strategy.</label>
            <p class="pfg-disclaimer">Educational information only. This guide does not constitute investment, legal, tax or financial advice. Real-estate investing involves risks, including loss of capital. Always verify local regulations and obtain independent professional advice where necessary.</p>
          </section>
        </div>
      </div>
    </div>`;

function printGuide() {
        const source = document.querySelector("#guide");

        if (!source || !source.innerText.trim()) {
            alert("The Investment Guide is empty or not loaded.");
            return;
        }

        const win = window.open("", "_blank", "width=900,height=700");

        if (!win) {
            alert("Allow pop-ups to print the guide.");
            return;
        }

        const clone = source.cloneNode(true);
        clone.querySelectorAll(".pfg-toc, .pfg-cta, .pfg-print").forEach(el => el.remove());

        const styles = [...document.querySelectorAll('link[rel="stylesheet"], style')]
            .map(el => el.outerHTML)
            .join("\n");

        win.document.open();
        win.document.write(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Property Investment Guide</title>
${styles}
<style>
@page { size: A4; margin: 14mm; }
html, body { background: white !important; color: #17251c !important; }
body { margin: 0 !important; padding: 0 !important; }
body > #guide { display: block !important; position: static !important; width: 100% !important; }
#guide * { visibility: visible !important; }
.pfg-toc, .pfg-cta, .pfg-print { display: none !important; }
.pfg-page { max-width: none !important; width: 100% !important; margin: 0 !important; }
.pfg-step, .pfg-checklist, .pfg-callout { box-shadow: none !important; }
</style>
</head>
<body></body>
</html>`);
        win.document.close();
        win.document.body.appendChild(clone);

        win.addEventListener("load", () => {
            win.focus();
            win.print();
        }, { once: true });

        // Fallback for browsers that fire load before the print listener is attached.
        win.setTimeout(() => {
            if (!win.closed) {
                win.focus();
                win.print();
            }
        }, 700);
    }
    function install() {
        const guide = document.querySelector("#guide");
        if (guide && !guide.dataset.pfRedesigned) {
            guide.dataset.pfRedesigned = "true";
            guide.innerHTML = guide;
            // Replace the old short guide with the complete guide.
            guide.innerHTML = guideContent();
        }

    }

    function guideContent() {
        return guide;
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", install, { once: true });
    } else {
        install();
    }
})();
