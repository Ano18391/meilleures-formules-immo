(() => {
    "use strict";

    const pageMap = {
        dashboard: [".welcome-section"],
        calculators: [".intro-section", "#tools"],
        guide: ["#guide"],
        properties: ["#dossier-immo"],
        calculator: ["#calculator-section"]
    };

    function setPage(page, options = {}) {
        if (!pageMap[page]) page = "dashboard";
        const main = document.querySelector(".main-content");
        if (!main) return;

        const allViews = [
            ".welcome-section", ".intro-section", "#tools", "#guide",
            "#dossier-immo", "#calculator-section"
        ];
        // Fade the content slightly before switching, then animate the new view in.
        main.classList.add("premium-switching");
        allViews.forEach(selector => {
            const element = main.querySelector(selector);
            if (element) element.hidden = true;
        });

        pageMap[page].forEach(selector => {
            const element = main.querySelector(selector);
            if (element) element.hidden = false;
        });
        requestAnimationFrame(() => {
            requestAnimationFrame(() => main.classList.remove("premium-switching"));
        });

        document.querySelectorAll(".sidebar-nav .nav-link").forEach(link => {
            const active = link.dataset.page === (page === "calculator" ? "calculators" : page);
            link.classList.toggle("active", active);
            if (active) link.setAttribute("aria-current", "page");
            else link.removeAttribute("aria-current");
        });

        const heading = document.querySelector(".breadcrumb strong");
        if (heading) {
            const labels = {
                dashboard: "Dashboard",
                calculators: "Calculators",
                guide: "Investment Guide",
                properties: "Property Workspace",
                calculator: "Calculator"
            };
            heading.textContent = labels[page];
        }

        if (options.updateHash !== false) {
            const hashes = { dashboard: "#home", calculators: "#tools", guide: "#guide", properties: "#dossier-immo", calculator: "#tools" };
            if (location.hash !== hashes[page]) history.replaceState(null, "", hashes[page]);
        }
        if (options.scroll !== false) main.scrollTo({ top: 0, behavior: "smooth" });
    }

    function pageFromHash() {
        const hash = location.hash;
        if (hash === "#tools") return "calculators";
        if (hash === "#guide") return "guide";
        if (hash === "#dossier-immo") return "properties";
        return "dashboard";
    }

    document.addEventListener("click", event => {
        const link = event.target.closest(".sidebar-nav .nav-link, .brand, .footer-brand, .welcome-button, .sidebar-tip a");
        if (link) {
            let page = link.dataset.page;
            if (!page) {
                const hash = new URL(link.href, location.href).hash;
                page = hash === "#tools" ? "calculators" : hash === "#guide" ? "guide" : hash === "#dossier-immo" ? "properties" : "dashboard";
            }
            event.preventDefault();
            setPage(page);
            return;
        }

        // Existing calculator logic handles opening/closing the calculator itself.
        if (event.target.closest("[data-open]")) {
            setTimeout(() => setPage("calculator", { scroll: true }), 0);
        } else if (event.target.closest("[data-back]")) {
            setTimeout(() => setPage("calculators", { scroll: true }), 0);
        }
    });

    window.addEventListener("hashchange", () => setPage(pageFromHash(), { updateHash: false, scroll: false }));
    document.addEventListener("DOMContentLoaded", () => {
        const saved = pageFromHash();
        setPage(saved, { updateHash: false, scroll: false });
    }, { once: true });
})();
