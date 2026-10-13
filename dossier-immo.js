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
            details.textContent = euro(price) + " · " + (data["property-address"] || "Adresse non renseignée");

            button.append(title, details);
            list.append(button);
        }
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
        message("Dossier chargé. Vous pouvez modifier les données puis enregistrer.", "success");
        $("#dossier-form").scrollIntoView({ behavior: "smooth", block: "start" });
    }

    async function loadDossiers() {
        const result = await request("properties", { method: "GET" });
        dossiers = Array.isArray(result.dossiers) ? result.dossiers : [];
        renderList();
    }

    async function refreshAccess() {
        try {
            const data = await request("me", { method: "GET" });
            signedIn = Boolean(data.user);
        } catch {
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

    function resetForm() {
        currentId = null;
        const deleteButton = $("#dossier-delete");
        if (deleteButton) deleteButton.hidden = true;
        $("#dossier-form").reset();
        calculate();
        message("Nouvelle fiche prête.");
    }

    function init() {
        const section = $("#dossier-immo");
        if (!section) return;

        const form = $("#dossier-form");

        form.addEventListener("input", () => calculate());

        $("#dossier-new").addEventListener("click", resetForm);

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.id = "dossier-delete";
        deleteButton.className = "dossier-delete";
        deleteButton.textContent = "Supprimer ce dossier";
        deleteButton.hidden = true;
        $("#dossier-save").parentElement.append(deleteButton);

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
