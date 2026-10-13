
(() => {
    "use strict";

    const $ = (selector, parent = document) =>
        parent.querySelector(selector);

    const $$ = (selector, parent = document) =>
        [...parent.querySelectorAll(selector)];

    const calculators = {
        brute: {
            title: "Gross Rental Yield",
            description: "Calculate your property's annual rental return before expenses.",
            fields: [
                { id: "price", label: "Property purchase price (€)", min: 1, value: 150000 },
                { id: "rent", label: "Monthly rent before charges (€)", min: 0, value: 750 }
            ],
            calculate(v) {
                const result = (v.rent * 12 / v.price) * 100;

                return {
                    title: "Gross Rental Yield",
                    value: `${format(result)}%`,
                    details: [
                        ["Annual rental income", money(v.rent * 12)],
                        ["Purchase price", money(v.price)]
                    ],
                    note: "This yield excludes expenses, taxes, maintenance, vacancy periods and acquisition costs."
                };
            }
        },

        nette: {
            title: "Net Rental Yield",
            description: "Estimate your rental return after deducting the annual expenses you enter.",
            fields: [
                { id: "price", label: "Property purchase price (€)", min: 1, value: 150000 },
                { id: "rent", label: "Monthly rent before charges (€)", min: 0, value: 750 },
                { id: "charges", label: "Annual property charges (€)", min: 0, value: 900 },
                { id: "tax", label: "Annual property tax (€)", min: 0, value: 800 },
                { id: "other", label: "Other annual expenses (€)", min: 0, value: 500 }
            ],
            calculate(v) {
                const annualRent = v.rent * 12;
                const expenses = v.charges + v.tax + v.other;
                const netIncome = annualRent - expenses;

                return {
                    title: "Estimated Net Rental Yield",
                    value: `${format(netIncome / v.price * 100)}%`,
                    details: [
                        ["Annual rental income", money(annualRent)],
                        ["Annual expenses", money(expenses)],
                        ["Annual income after expenses", money(netIncome)]
                    ],
                    note: "This estimate excludes rental income tax, financing costs and any acquisition costs not entered."
                };
            }
        },

        cashflow: {
            title: "Monthly Cash Flow",
            description: "Estimate how much money remains each month after your main property expenses.",
            fields: [
                { id: "rent", label: "Monthly rental income (€)", min: 0, value: 750 },
                { id: "loan", label: "Monthly loan payment (€)", min: 0, value: 500 },
                { id: "charges", label: "Monthly service charges (€)", min: 0, value: 60 },
                { id: "insurance", label: "Monthly landlord insurance (€)", min: 0, value: 15 },
                { id: "tax", label: "Monthly property tax allowance (€)", min: 0, value: 65 },
                { id: "other", label: "Other monthly expenses (€)", min: 0, value: 25 }
            ],
            calculate(v) {
                const expenses =
                    v.loan + v.charges + v.insurance + v.tax + v.other;

                const monthly = v.rent - expenses;

                return {
                    title: "Estimated Monthly Cash Flow",
                    value: money(monthly),
                    details: [
                        ["Monthly rental income", money(v.rent)],
                        ["Total monthly expenses", money(expenses)],
                        ["Estimated annual cash flow", money(monthly * 12)]
                    ],
                    note: "A positive result indicates a surplus before any expenses, taxes or other costs not included in your inputs."
                };
            }
        },

        regle70: {
            title: "70% Rule",
            description: "Compare your loan payment with an indicative threshold based on rent after selected expenses.",
            fields: [
                { id: "rent", label: "Monthly rental income (€)", min: 0, value: 900 },
                { id: "charges", label: "Monthly expenses excluding the loan (€)", min: 0, value: 100 },
                { id: "loan", label: "Monthly loan payment (€)", min: 0, value: 500 }
            ],
            calculate(v) {
                const rentAfterExpenses = Math.max(0, v.rent - v.charges);
                const threshold = rentAfterExpenses * 0.70;
                const margin = threshold - v.loan;

                return {
                    title: "70% Rule Assessment",
                    value: margin >= 0 ? "Threshold met" : "Threshold exceeded",
                    details: [
                        ["Rent after entered expenses", money(rentAfterExpenses)],
                        ["Indicative 70% threshold", money(threshold)],
                        ["Monthly loan payment", money(v.loan)],
                        ["Margin against threshold", money(margin)]
                    ],
                    note: "This is an indicative rule of thumb, not a banking standard or a guarantee of investment profitability."
                };
            }
        },

        endettement: {
            title: "Debt-to-Income Ratio",
            description: "Estimate the share of your monthly income used for debt repayments.",
            fields: [
                { id: "income", label: "Monthly net income (€)", min: 1, value: 3000 },
                { id: "existing", label: "Existing monthly debt payments (€)", min: 0, value: 400 },
                { id: "new", label: "Proposed new monthly payment (€)", min: 0, value: 600 }
            ],
            calculate(v) {
                const totalDebt = v.existing + v.new;
                const ratio = totalDebt / v.income * 100;

                return {
                    title: "Estimated Debt-to-Income Ratio",
                    value: `${format(ratio)}%`,
                    details: [
                        ["Monthly net income", money(v.income)],
                        ["Total monthly debt payments", money(totalDebt)],
                        ["Income remaining after debt payments", money(v.income - totalDebt)]
                    ],
                    note: "This is an estimate. Lenders may apply different eligibility criteria and income calculations depending on the country."
                };
            }
        },

        mensualite: {
            title: "Affordable Monthly Payment",
            description: "Estimate a theoretical monthly payment based on your income and selected repayment ratio.",
            fields: [
                { id: "income", label: "Monthly net income (€)", min: 1, value: 3000 },
                { id: "existing", label: "Existing monthly debt payments (€)", min: 0, value: 400 },
                { id: "ratio", label: "Selected repayment ratio (%)", min: 1, max: 100, step: 1, value: 35 }
            ],
            calculate(v) {
                const targetPayment = v.income * v.ratio / 100;
                const available = targetPayment - v.existing;

                return {
                    title: "Estimated Available Monthly Payment",
                    value: money(available),
                    details: [
                        ["Selected income limit", money(targetPayment)],
                        ["Existing debt payments", money(v.existing)],
                        ["Selected repayment ratio", `${format(v.ratio)}%`]
                    ],
                    note: "This is a theoretical estimate, not a loan offer. Lenders may also assess living expenses, household circumstances and other criteria."
                };
            }
        },

        capital: {
            title: "Borrowing Capacity",
            description: "Estimate a theoretical loan amount based on your monthly payment, interest rate and loan term.",
            fields: [
                { id: "payment", label: "Available monthly payment (€)", min: 1, value: 700 },
                { id: "rate", label: "Annual nominal interest rate (%)", min: 0, max: 30, step: 0.1, value: 3.5 },
                { id: "years", label: "Loan term (years)", min: 1, max: 40, step: 1, value: 20 }
            ],
            calculate(v) {
                const months = v.years * 12;
                const monthlyRate = v.rate / 100 / 12;

                const principal = monthlyRate === 0
                    ? v.payment * months
                    : v.payment *
                      (1 - Math.pow(1 + monthlyRate, -months)) /
                      monthlyRate;

                return {
                    title: "Estimated Borrowing Capacity",
                    value: money(principal),
                    details: [
                        ["Monthly payment", money(v.payment)],
                        ["Loan term", `${v.years} years`],
                        ["Annual nominal interest rate", `${format(v.rate)}%`],
                        ["Total scheduled payments", money(v.payment * months)]
                    ],
                    note: "This estimate excludes mortgage insurance, arrangement fees, legal fees and lender eligibility requirements."
                };
            }
        }
    };

    function format(value) {
        return new Intl.NumberFormat("en-GB", {
            maximumFractionDigits: 2
        }).format(Number.isFinite(value) ? value : 0);
    }

    function money(value) {
        return new Intl.NumberFormat("en-GB", {
            style: "currency",
            currency: "EUR",
            maximumFractionDigits: 2
        }).format(Number.isFinite(value) ? value : 0);
    }

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    function getCalculatorElements() {
        return {
            section: $("#calculator-section"),
            container: $("#calculator")
        };
    }

    function showCalculator(key) {
        const calculator = calculators[key];
        const { section, container } = getCalculatorElements();

        if (!calculator || !section || !container) {
            console.error("Calculator not found:", key);
            return;
        }

        container.innerHTML = `
            <div class="calculator-header">
                <button type="button" class="back-button" data-back>
                    ← Back to calculators
                </button>

                <p class="eyebrow">PROPERTY CALCULATOR</p>
                <h2>${escapeHTML(calculator.title)}</h2>
                <p>${escapeHTML(calculator.description)}</p>
            </div>

            <form id="calculator-form" novalidate>
                <div class="calculator-fields">
                    ${calculator.fields.map(field => `
                        <div class="form-field">
                            <label for="field-${escapeHTML(field.id)}">
                                ${escapeHTML(field.label)}
                            </label>

                            <input
                                id="field-${escapeHTML(field.id)}"
                                name="${escapeHTML(field.id)}"
                                type="number"
                                min="${field.min ?? 0}"
                                ${field.max !== undefined ? `max="${field.max}"` : ""}
                                step="${field.step ?? "any"}"
                                value="${field.value ?? ""}"
                                required
                                inputmode="decimal"
                                aria-invalid="false"
                            >

                            <small class="field-error" aria-live="polite"></small>
                        </div>
                    `).join("")}
                </div>

                <div class="calculator-actions">
                    <button type="submit" class="primary-button">
                        Calculate result
                    </button>

                    <button type="reset" class="secondary-button">
                        Reset values
                    </button>
                </div>

                <div
                    id="calculator-result"
                    class="calculator-result"
                    hidden
                    aria-live="polite"
                ></div>
            </form>
        `;

        section.hidden = false;
        section.scrollIntoView({ behavior: "smooth", block: "start" });

        const form = $("#calculator-form", container);
        const result = $("#calculator-result", container);

        form.addEventListener("submit", event => {
            event.preventDefault();

            let valid = true;
            const values = {};

            calculator.fields.forEach(field => {
                const input = $(`#field-${CSS.escape(field.id)}`, form);
                const error = $(".field-error", input.parentElement);
                const rawValue = input.value.trim();
                const number = Number(rawValue);

                let message = "";

                if (rawValue === "" || !Number.isFinite(number)) {
                    message = "Please enter a valid number.";
                } else if (number < (field.min ?? 0)) {
                    message = `The minimum value is ${field.min ?? 0}.`;
                } else if (field.max !== undefined && number > field.max) {
                    message = `The maximum value is ${field.max}.`;
                }

                input.setAttribute("aria-invalid", message ? "true" : "false");
                error.textContent = message;

                if (message) {
                    valid = false;
                } else {
                    values[field.id] = number;
                }
            });

            if (!valid) {
                result.hidden = true;
                return;
            }

            try {
                renderResult(calculator.calculate(values), result);
                result.hidden = false;
                result.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest"
                });
            } catch (error) {
                console.error("Calculation error:", error);
                result.innerHTML = `
                    <p>An error occurred. Please check your input values and try again.</p>
                `;
                result.hidden = false;
            }
        });

        form.addEventListener("reset", () => {
            setTimeout(() => {
                $$(".field-error", form).forEach(element => {
                    element.textContent = "";
                });

                $$("input", form).forEach(input => {
                    input.setAttribute("aria-invalid", "false");
                });

                result.hidden = true;
                result.innerHTML = "";
            }, 0);
        });
    }

    function renderResult(data, container) {
        container.innerHTML = `
            <div class="result-heading">
                <p class="eyebrow">YOUR ESTIMATE</p>
                <h3>${escapeHTML(data.title)}</h3>
                <div class="result-main-value">${escapeHTML(data.value)}</div>
            </div>

            <div class="result-details">
                ${data.details.map(([label, value]) => `
                    <div class="result-row">
                        <span>${escapeHTML(label)}</span>
                        <strong>${escapeHTML(value)}</strong>
                    </div>
                `).join("")}
            </div>

            <p class="result-note">${escapeHTML(data.note)}</p>
        `;
    }

    function closeCalculator() {
        const { section } = getCalculatorElements();

        if (section) {
            section.hidden = true;
        }

        const tools = $("#tools");

        if (tools) {
            tools.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    }

    function initializeTheme() {
        const selector = $("#theme-select");
        const allowedThemes = ["dark", "light", "night", "cosy", "sakura"];

        function applyTheme(theme, save = true) {
            if (!allowedThemes.includes(theme)) {
                theme = "dark";
            }

            document.documentElement.dataset.theme = theme;

            if (selector) {
                selector.value = theme;
            }

            const meta = $('meta[name="theme-color"]');

            if (meta) {
                const colors = {
                    dark: "#101b18",
                    light: "#f6f8f5",
                    night: "#111827",
                    cosy: "#f4eadb",
                    sakura: "#fff1f5"
                };

                meta.setAttribute("content", colors[theme]);
            }

            if (save) {
                try {
                    localStorage.setItem("property-formulas-theme", theme);
                } catch (error) {
                    console.warn("Theme preference could not be saved.", error);
                }
            }
        }

        let savedTheme = "dark";

        try {
            savedTheme = localStorage.getItem("property-formulas-theme") || "sakura";
        } catch (error) {
            console.warn("Local storage is unavailable.", error);
        }

        applyTheme(savedTheme, false);

        if (selector) {
            selector.addEventListener("change", () => {
                applyTheme(selector.value);
            });
        }
    }

    function initializeNavigation() {
        document.addEventListener("click", event => {
            const openButton = event.target.closest("[data-open]");

            if (openButton) {
                event.preventDefault();
                showCalculator(openButton.dataset.open);
                return;
            }

            const backButton = event.target.closest("[data-back]");

            if (backButton) {
                event.preventDefault();
                closeCalculator();
            }
        });
    }


    function initializeAccount() {
        const API = "https://property-formulas-api.vercel.app/api";
        const section = document.querySelector("#account-section");
        if (!section) return;

        const $a = selector => section.querySelector(selector);
        const message = $a("#account-message");
        const loggedOut = $a("#account-logged-out");
        const loggedIn = $a("#account-logged-in");
        
        // PASSWORD_VISIBILITY_TOGGLE
        const passwordStyle = document.createElement("style");
        passwordStyle.textContent = `
            .password-field-wrap {
                position: relative;
                display: flex;
                width: 100%;
            }

            .password-field-wrap input {
                width: 100%;
                min-width: 0;
                padding-right: 5.5rem;
            }

            .password-toggle {
                position: absolute;
                right: 8px;
                top: 50%;
                transform: translateY(-50%);
                border: 0;
                background: transparent;
                color: inherit;
                opacity: 0.8;
                cursor: pointer;
                padding: 6px 8px;
                font: inherit;
                font-size: 0.85rem;
                border-radius: 6px;
            }

            .password-toggle:hover {
                opacity: 1;
                background: rgba(128, 128, 128, 0.12);
            }

            .password-toggle:focus-visible {
                outline: 2px solid currentColor;
                outline-offset: 2px;
            }
        `;
        document.head.appendChild(passwordStyle);

        section.querySelectorAll('input[type="password"]').forEach(input => {
            const wrapper = document.createElement("div");
            wrapper.className = "password-field-wrap";
            input.parentNode.insertBefore(wrapper, input);
            wrapper.appendChild(input);

            const toggle = document.createElement("button");
            toggle.type = "button";
            toggle.className = "password-toggle";
            toggle.textContent = "Afficher";
            toggle.setAttribute("aria-label", "Afficher le mot de passe");
            toggle.setAttribute("aria-pressed", "false");

            toggle.addEventListener("click", () => {
                const show = input.type === "password";
                input.type = show ? "text" : "password";
                toggle.textContent = show ? "Masquer" : "Afficher";
                toggle.setAttribute(
                    "aria-label",
                    show ? "Masquer le mot de passe" : "Afficher le mot de passe"
                );
                toggle.setAttribute("aria-pressed", String(show));
            });

            wrapper.appendChild(toggle);
        });

        let resetToken = null;
        let pendingRecoveryCode = null;

        function showMessage(text, type = "info") {
            message.textContent = text;
            message.className = `account-message ${type}`;
            message.hidden = false;
        }

        function clearMessage() {
            message.textContent = "";
            message.hidden = true;
            message.className = "account-message";
        }

        function showView(view) {
            clearMessage();

            if (view !== "reset") {
                resetToken = null;
            }

            pendingRecoveryCode = null;
            $a("#recovery-display").hidden = true;

            ["login", "register", "forgot", "reset"].forEach(name => {
                const form = $a(`#${name}-form`);
                if (form) form.hidden = name !== view;
            });

            $a("#account-title").textContent = ({
                login: "Welcome back",
                register: "Create your account",
                forgot: "Recover your account",
                reset: "Choose a new password"
            })[view];

            section.querySelectorAll("[data-auth-view]").forEach(button => {
                button.classList.toggle("active", button.dataset.authView === view);
            });
        }

        async function request(path, options = {}) {
            let response;
            try {
                response = await fetch(`${API}/${path}`, {
                    ...options,
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        ...(options.headers || {})
                    }
                });
            } catch (error) {
                throw new Error("Could not reach the API. Check your connection and try again.");
            }

            let data = {};
            try {
                data = await response.json();
            } catch {
                throw new Error(`The API returned an invalid response (HTTP ${response.status}).`);
            }

            if (!response.ok) {
                throw new Error(data.error || `Request failed (HTTP ${response.status}).`);
            }
            return data;
        }

        function setBusy(form, busy) {
            const button = form.querySelector('button[type="submit"]');
            if (!button) return;
            if (busy) {
                button.dataset.originalText = button.textContent;
                button.disabled = true;
                button.textContent = "Please wait…";
            } else {
                button.disabled = false;
                button.textContent = button.dataset.originalText || "Submit";
            }
        }

        async function runForm(form, callback) {
            form.addEventListener("submit", async event => {
                event.preventDefault();
                clearMessage();

                if (!form.reportValidity()) return;

                setBusy(form, true);
                try {
                    await callback(new FormData(form));
                } catch (error) {
                    showMessage(error.message || "Something went wrong. Please try again.", "error");
                } finally {
                    setBusy(form, false);
                }
            });
        }

        function showRecoveryCode(code, messageText) {
            pendingRecoveryCode = code || null;

            loggedOut.hidden = false;
            loggedIn.hidden = true;

            const display = $a("#recovery-display");
            const codeElement = $a("#recovery-code-value");

            codeElement.textContent = code || "No recovery code was returned by the API.";
            display.hidden = false;

            section.querySelectorAll(".account-tabs, .account-form").forEach(element => {
                element.hidden = true;
            });

            showMessage(
                code
                    ? messageText
                    : "The API did not return a recovery code. Do not close this window until this is resolved.",
                code ? "success" : "error"
            );
        }

        async function refreshSession() {
            try {
                const data = await request("me", { method: "GET", headers: {} });
                loggedOut.hidden = true;
                loggedIn.hidden = false;
                $a("#account-username").textContent = data.user.username;
                return true;
            } catch {
                loggedIn.hidden = true;
                loggedOut.hidden = false;
                window.dispatchEvent(
                    new CustomEvent("property-formulas:logout")
                );
                return false;
            }
        }

        document.querySelector("#account-open")?.addEventListener("click", async () => {
            section.hidden = false;
            await refreshSession();
            section.scrollIntoView({ behavior: "smooth", block: "start" });
        });

        $a("#account-close").addEventListener("click", () => {
            section.hidden = true;
        });

        section.querySelectorAll("[data-auth-view]").forEach(button => {
            button.addEventListener("click", () => {
                $a("#recovery-display").hidden = true;
                section.querySelectorAll(".account-tabs").forEach(element => element.hidden = false);
                showView(button.dataset.authView);
            });
        });

        runForm($a("#login-form"), async formData => {
            const data = await request("login", {
                method: "POST",
                body: JSON.stringify({
                    username: formData.get("username"),
                    password: formData.get("password")
                })
            });
            await refreshSession();
            showMessage(data.message || "Signed in successfully.", "success");
        });

        runForm($a("#register-form"), async formData => {
            if (formData.get("password") !== formData.get("confirmPassword")) {
                throw new Error("Passwords do not match.");
            }

            const data = await request("register", {
                method: "POST",
                body: JSON.stringify({
                    username: formData.get("username"),
                    password: formData.get("password"),
                    confirmPassword: formData.get("confirmPassword")
                })
            });

            await refreshSession();
            showRecoveryCode(data.recoveryCode, data.message || "Account created. Save your recovery code.");
        });

        runForm($a("#forgot-form"), async formData => {
            const data = await request("forgot-password", {
                method: "POST",
                body: JSON.stringify({
                    username: formData.get("username"),
                    recoveryCode: formData.get("recoveryCode")
                })
            });

            resetToken = data.resetToken;
            showView("reset");
            showMessage(data.message || "Recovery code verified.", "success");
        });

        runForm($a("#reset-form"), async formData => {
            if (!resetToken) throw new Error("Start account recovery again.");
            if (formData.get("newPassword") !== formData.get("confirmPassword")) {
                throw new Error("Passwords do not match.");
            }

            const data = await request("reset-password", {
                method: "POST",
                body: JSON.stringify({
                    resetToken,
                    newPassword: formData.get("newPassword"),
                    confirmPassword: formData.get("confirmPassword")
                })
            });

            resetToken = null;
            showView("login");
            showRecoveryCode(data.recoveryCode, data.message || "Password updated. Save your new recovery code.");
        });

        $a("#copy-recovery-code").addEventListener("click", async () => {
            if (!pendingRecoveryCode) return;
            try {
                await navigator.clipboard.writeText(pendingRecoveryCode);
                showMessage("Recovery code copied. Store it somewhere safe.", "success");
            } catch {
                showMessage("Copy was blocked by your browser. Select and copy the code manually.", "error");
            }
        });

        $a("#recovery-continue").addEventListener("click", async () => {
            pendingRecoveryCode = null;
            $a("#recovery-display").hidden = true;
            section.querySelectorAll(".account-tabs").forEach(element => element.hidden = false);
            if (await refreshSession()) {
                showMessage("Your account is ready.", "success");
            } else {
                showView("login");
                showMessage("Recovery complete. Sign in with your new password.", "success");
            }
        });

        $a("#account-logout").addEventListener("click", async () => {
            try {
                const data = await request("logout", { method: "POST", body: "{}" });

                loggedIn.hidden = true;
                loggedOut.hidden = false;

                window.dispatchEvent(
                    new CustomEvent("property-formulas:logout")
                );

                pendingRecoveryCode = null;
                resetToken = null;
                $a("#recovery-display").hidden = true;

                section.querySelectorAll(".account-tabs").forEach(element => {
                    element.hidden = false;
                });

                showView("login");
                showMessage(data.message || "Signed out.", "success");
            } catch (error) {
                showMessage(error.message || "Sign out failed.", "error");
            }
        });

        showView("login");
    }

    function initialize() {
        initializeTheme();
        initializeNavigation();
        initializeAccount();

        const { section } = getCalculatorElements();

        if (section) {
            section.hidden = true;
        }

        console.info("Property Formulas: calculators initialized.");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize, { once: true });
    } else {
        initialize();
    }
})();

/* FIX: afficher ou masquer les mots de passe */
(function () {
    function addPasswordButtons() {
        document.querySelectorAll('input[type="password"], input[data-password-toggle="ready"]').forEach(function (input) {
            if (input.dataset.passwordToggleReady === "yes") return;

            input.dataset.passwordToggleReady = "yes";

            var wrapper = document.createElement("span");
            wrapper.style.cssText = "position:relative;display:flex;width:100%;align-items:center;";

            input.parentNode.insertBefore(wrapper, input);
            wrapper.appendChild(input);

            input.style.setProperty("width", "100%", "important");
            input.style.setProperty("box-sizing", "border-box", "important");
            input.style.setProperty("padding-right", "100px", "important");

            var button = document.createElement("button");
            button.type = "button";
            button.textContent = "Afficher";
            button.style.cssText = "position:absolute;right:8px;top:50%;transform:translateY(-50%);z-index:10;cursor:pointer;padding:6px 8px;border:0;border-radius:6px;background:transparent;color:inherit;font:inherit;font-size:13px;";

            button.addEventListener("click", function () {
                var visible = input.type === "password";
                input.type = visible ? "text" : "password";
                button.textContent = visible ? "Masquer" : "Afficher";
            });

            wrapper.appendChild(button);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", addPasswordButtons);
    } else {
        addPasswordButtons();
    }

    new MutationObserver(addPasswordButtons).observe(document.documentElement, {
        childList: true,
        subtree: true
    });
})();
