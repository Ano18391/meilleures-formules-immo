(() => {
    "use strict";

    const selectors = [
        ".pf-fox-icon",
        ".pf-fox-mark",
        '[class*="fox-icon" i]',
        '[class*="fox-logo" i]',
        '[id*="pf-fox" i]',
        'svg[aria-label*="fox" i]',
        'img[alt*="fox" i]',
        'img[title*="fox" i]'
    ].join(",");

    function removeFoxes(root = document) {
        if (root.matches?.(selectors)) {
            root.remove();
            return;
        }

        root.querySelectorAll?.(selectors).forEach(element => element.remove());
    }

    function clean() {
        removeFoxes();

        document.querySelectorAll("*").forEach(element => {
            if (
                element.children.length === 0 &&
                element.textContent.trim() === "🦊"
            ) {
                element.remove();
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", clean, { once: true });
    } else {
        clean();
    }

    new MutationObserver(records => {
        for (const record of records) {
            record.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    removeFoxes(node);
                }
            });
        }
    }).observe(document.documentElement, {
        childList: true,
        subtree: true
    });
})();
