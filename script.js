const calculatorSection = document.getElementById("calculator-section");
const calculator = document.getElementById("calculator");

function input(id, label, placeholder = "0") {
    return `
        <div class="input-group">
            <label for="${id}">${label}</label>
            <input
                type="number"
                id="${id}"
                placeholder="${placeholder}"
                min="0"
                step="0.01"
            >
        </div>
    `;
}

function showCalculator(type) {

    calculatorSection.classList.remove("hidden");

    let html = "";

    if (type === "brute") {

        html = `
            <div class="calculator-box">

                <h2>🏠 Rentabilité brute</h2>

                <p class="calculator-description">
                    Calcule la rentabilité brute annuelle de ton investissement.
                </p>

                <div class="form-grid">

                    ${input(
                        "loyer",
                        "💶 Loyer annuel (€)",
                        "12000"
                    )}

                    ${input(
                        "prix",
                        "🏠 Prix du logement (€)",
                        "200000"
                    )}

                </div>

                <button
                    class="calculate-button"
                    onclick="calculerBrute()"
                >
                    🧮 Calculer la rentabilité
                </button>

                <div id="result"></div>

            </div>
        `;
    }


    else if (type === "nette") {

        html = `
            <div class="calculator-box">

                <h2>📈 Rentabilité nette</h2>

                <p class="calculator-description">
                    Calcule ta rentabilité après les principales charges.
                </p>

                <div class="form-grid">

                    ${input("loyer", "💶 Loyer annuel (€)", "12000")}

                    ${input(
                        "charges",
                        "🏢 Charges non récupérables (€)",
                        "1000"
                    )}

                    ${input(
                        "taxes",
                        "🏛️ Taxes foncières (€)",
                        "1200"
                    )}

                    ${input(
                        "frais",
                        "👨‍💼 Frais de gestion (€)",
                        "500"
                    )}

                    ${input(
                        "prix",
                        "🏠 Prix du logement (€)",
                        "200000"
                    )}

                </div>

                <button
                    class="calculate-button"
                    onclick="calculerNette()"
                >
                    🧮 Calculer la rentabilité
                </button>

                <div id="result"></div>

            </div>
        `;
    }


    else if (type === "cashflow") {

        html = `
            <div class="calculator-box">

                <h2>💰 Cashflow</h2>

                <p class="calculator-description">
                    Estime ton cashflow mensuel après tes principales dépenses.
                </p>

                <div class="form-grid">

                    ${input(
                        "loyers",
                        "💶 Loyers encaissés / mois (€)",
                        "1000"
                    )}

                    ${input(
                        "mensualite",
                        "🏦 Mensualité du crédit (€)",
                        "600"
                    )}

                    ${input(
                        "charges",
                        "🏢 Charges de copropriété (€)",
                        "100"
                    )}

                    ${input(
                        "assurance",
                        "🛡️ Assurance PNO (€)",
                        "20"
                    )}

                    ${input(
                        "taxes",
                        "🏛️ Taxes foncières mensualisées (€)",
                        "100"
                    )}

                    ${input(
                        "frais",
                        "📦 Frais divers (€)",
                        "30"
                    )}

                </div>

                <button
                    class="calculate-button"
                    onclick="calculerCashflow()"
                >
                    🧮 Calculer le cashflow
                </button>

                <div id="result"></div>

            </div>
        `;
    }


    else if (type === "regle70") {

        html = `
            <div class="calculator-box">

                <h2>🔥 Règle des 70</h2>

                <p class="calculator-description">
                    Vérifie si ta mensualité respecte la règle des 70%.
                </p>

                <div class="form-grid">

                    ${input(
                        "mensualite",
                        "🏦 Mensualité du crédit (€)",
                        "700"
                    )}

                    ${input(
                        "loyers",
                        "💶 Loyers nets / mois (€)",
                        "1000"
                    )}

                </div>

                <button
                    class="calculate-button"
                    onclick="calculerRegle70()"
                >
                    🔥 Vérifier
                </button>

                <div id="result"></div>

            </div>
        `;
    }


    else if (type === "endettement") {

        html = `
            <div class="calculator-box">

                <h2>📊 Taux d'endettement</h2>

                <p class="calculator-description">
                    Calcule ton taux d'endettement mensuel.
                </p>

                <div class="form-grid">

                    ${input(
                        "charges",
                        "💳 Charges mensuelles (€)",
                        "800"
                    )}

                    ${input(
                        "revenu",
                        "💶 Revenu net mensuel (€)",
                        "2500"
                    )}

                </div>

                <button
                    class="calculate-button"
                    onclick="calculerEndettement()"
                >
                    🧮 Calculer
                </button>

                <div id="result"></div>

            </div>
        `;
    }


    else if (type === "mensualite") {

        html = `
            <div class="calculator-box">

                <h2>💳 Mensualité maximale</h2>

                <p class="calculator-description">
                    Estime la mensualité maximale selon tes revenus.
                </p>

                <div class="form-grid">

                    ${input(
                        "revenu",
                        "💶 Revenus nets mensuels (€)",
                        "2500"
                    )}

                    ${input(
                        "charge",
                        "💳 Crédits en cours (€)",
                        "300"
                    )}

                </div>

                <button
                    class="calculate-button"
                    onclick="calculerMensualite()"
                >
                    🧮 Calculer
                </button>

                <div id="result"></div>

            </div>
        `;
    }


    else if (type === "capital") {

        html = `
            <div class="calculator-box">

                <h2>👏 Capital maximal</h2>

                <p class="calculator-description">
                    Estime le montant maximal que tu pourrais emprunter.
                </p>

                <div class="form-grid">

                    ${input(
                        "salaire",
                        "💶 Salaire net mensuel (€)",
                        "2500"
                    )}

                    ${input(
                        "mois",
                        "📅 Nombre de mois du prêt",
                        "240"
                    )}

                </div>

                <button
                    class="calculate-button"
                    onclick="calculerCapital()"
                >
                    🧮 Calculer
                </button>

                <div id="result"></div>

            </div>
        `;
    }


    calculator.innerHTML = html;

    calculatorSection.scrollIntoView({
        behavior: "smooth"
    });
}


/* =========================
   AFFICHAGE DU RESULTAT
========================= */

function afficherResultat(
    titre,
    valeur,
    message = ""
) {

    document.getElementById("result").innerHTML = `

        <div class="result">

            <div class="result-title">
                ${titre}
            </div>

            <div class="result-value">
                ${valeur}
            </div>

            ${
                message
                    ? `<div class="result-message">${message}</div>`
                    : ""
            }

        </div>
    `;
}


/* =========================
   RENTABILITÉ BRUTE
========================= */

function calculerBrute() {

    const loyer =
        Number(document.getElementById("loyer").value);

    const prix =
        Number(document.getElementById("prix").value);

    if (prix <= 0) {

        afficherErreur(
            "Le prix du bien doit être supérieur à 0."
        );

        return;
    }

    const total =
        (loyer / prix) * 100;

    afficherResultat(
        "📈 Rentabilité brute",
        `${total.toFixed(1)} %`
    );
}


/* =========================
   RENTABILITÉ NETTE
========================= */

function calculerNette() {

    const loyer =
        Number(document.getElementById("loyer").value);

    const charges =
        Number(document.getElementById("charges").value);

    const taxes =
        Number(document.getElementById("taxes").value);

    const frais =
        Number(document.getElementById("frais").value);

    const prix =
        Number(document.getElementById("prix").value);

    if (prix <= 0) {

        afficherErreur(
            "Le prix du bien doit être supérieur à 0."
        );

        return;
    }

    const total =
        (
            (loyer - charges - taxes - frais)
            / prix
        ) * 100;

    afficherResultat(
        "📈 Rentabilité nette",
        `${total.toFixed(1)} %`
    );
}


/* =========================
   CASHFLOW
========================= */

function calculerCashflow() {

    const loyers =
        Number(document.getElementById("loyers").value);

    const mensualite =
        Number(document.getElementById("mensualite").value);

    const charges =
        Number(document.getElementById("charges").value);

    const assurance =
        Number(document.getElementById("assurance").value);

    const taxes =
        Number(document.getElementById("taxes").value);

    const frais =
        Number(document.getElementById("frais").value);

    const total =
        loyers -
        (
            mensualite
            + charges
            + assurance
            + taxes
            + frais
        );

    const message =
        total >= 0
            ? "🤑 Ton cashflow est positif !"
            : "🔴 Ton cashflow est négatif.";

    afficherResultat(
        "💰 Cashflow mensuel",
        `${total.toFixed(1)} €`,
        message
    );
}


/* =========================
   RÈGLE DES 70
========================= */

function calculerRegle70() {

    const mensualite =
        Number(document.getElementById("mensualite").value);

    const loyers =
        Number(document.getElementById("loyers").value);

    const limite =
        loyers * 0.70;

    if (mensualite <= limite) {

        afficherResultat(
            "🔥 Résultat",
            "OK ✅",
            `Ta mensualité maximale selon la règle des 70 est de ${limite.toFixed(1)} €.`
        );

    } else {

        afficherResultat(
            "🔥 Résultat",
            "Attention ⚠️",
            `La limite de 70% est de ${limite.toFixed(1)} €.`
        );
    }
}


/* =========================
   ENDETTEMENT
========================= */

function calculerEndettement() {

    const charges =
        Number(document.getElementById("charges").value);

    const revenu =
        Number(document.getElementById("revenu").value);

    if (revenu <= 0) {

        afficherErreur(
            "Le revenu doit être supérieur à 0."
        );

        return;
    }

    const total =
        (charges / revenu) * 100;

    afficherResultat(
        "📊 Taux d'endettement",
        `${total.toFixed(1)} %`
    );
}


/* =========================
   MENSUALITÉ MAXIMALE
========================= */

function calculerMensualite() {

    const revenu =
        Number(document.getElementById("revenu").value);

    const charge =
        Number(document.getElementById("charge").value);

    const total =
        (revenu * 0.35) - charge;

    afficherResultat(
        "💳 Mensualité maximale",
        `${total.toFixed(1)} €`
    );
}


/* =========================
   CAPITAL MAXIMAL
========================= */

function calculerCapital() {

    const salaire =
        Number(document.getElementById("salaire").value);

    const mois =
        Number(document.getElementById("mois").value);

    if (mois <= 0) {

        afficherErreur(
            "Le nombre de mois doit être supérieur à 0."
        );

        return;
    }

    const total =
        (salaire * 0.35 * mois) / 1.4;

    afficherResultat(
        "👏 Emprunt maximal",
        `${total.toFixed(1)} €`
    );
}


/* =========================
   ERREUR
========================= */

function afficherErreur(message) {

    document.getElementById("result").innerHTML = `

        <div
            class="result"
            style="
                background:#fff0f0;
                border-color:#ffcaca;
            "
        >

            <div
                class="result-message"
                style="color:#d63031;"
            >
                ⚠️ ${message}
            </div>

        </div>
    `;
}


/* =========================
   RETOUR
========================= */

function closeCalculator() {

    calculatorSection.classList.add("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}