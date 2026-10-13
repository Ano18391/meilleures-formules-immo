(function () {
    function installPasswordToggles() {
        document.querySelectorAll('input[type="password"]').forEach(function (input) {
            if (input.dataset.toggleInstalled === "true") {
                return;
            }

            input.dataset.toggleInstalled = "true";

            const wrapper = document.createElement("span");
            wrapper.className = "password-toggle-wrapper";

            input.parentNode.insertBefore(wrapper, input);
            wrapper.appendChild(input);

            const button = document.createElement("button");
            button.type = "button";
            button.className = "password-toggle-button";
            button.textContent = "Afficher";
            button.setAttribute("aria-label", "Afficher le mot de passe");
            button.setAttribute("aria-pressed", "false");

            button.addEventListener("click", function () {
                const showPassword = input.type === "password";

                input.type = showPassword ? "text" : "password";
                button.textContent = showPassword ? "Masquer" : "Afficher";
                button.setAttribute(
                    "aria-label",
                    showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"
                );
                button.setAttribute("aria-pressed", String(showPassword));
            });

            wrapper.appendChild(button);
        });
    }

    function start() {
        installPasswordToggles();

        const observer = new MutationObserver(function () {
            installPasswordToggles();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }
})();
