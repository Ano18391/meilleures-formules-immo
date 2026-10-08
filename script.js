const calculatorSection = document.getElementById("calculator-section");
const calculator = document.getElementById("calculator");

const money = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
});

const number = new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 1
});


function input(id, label, placeholder = "0", suffix = "€") {
    return `
        <div class="input-group">
            <label for="${id}">${label}</label>

            <div class="input-wrapper">
                <input
                    type="number"
                    id="${id}"
                    placeholder="${placeholder}"
                    min="0"
                    step="0.01"
                    inputmode="decimal"
                >

                ${suffix ? `<span class="input-suffix">${suffix}</span>` : ""}
            </div>
        </div>
    `;
}


function showCalculator(type) {

    calculatorSection.classList.remove("hidden");

    let html = "";

    const calculators = {

        brute: {
            icon: "🏠",
            title: "Rentabilité brute",
            description: "Mesure rapidement la performance locative de ton investissement.",

            fields: `
                ${input("loyer", "Loyer annuel", "12000")}
                ${input("prix", "Prix total du bien", "200000")}
            `,

            button: "Calculer ma rentabilité",

            action: "calculerBrute()"
        },


        nette: {
            icon: "📈",
            title: "Rentabilité nette",
            description: "Une vision plus réaliste en intégrant les principales dépenses.",

            fields: `
                ${input("loyer", "Loyer annuel", "12000")}
                ${input("charges", "Charges non récupérables", "1000")}
                ${input("taxes", "Taxe foncière", "1200")}
                ${input("frais", "Frais de gestion", "500")}
                ${input("prix", "Prix total du bien", "200000")}
            `,

            button: "Calculer ma rentabilité nette",

            action: "calculerNette()"
        },


        cashflow: {
            icon: "💰",
            title: "Cashflow",
            description: "Découvre combien ton investissement te laisse chaque mois.",

            fields: `
                ${input("loyers", "Loyers encaissés / mois", "1000")}
                ${input("mensualite", "Mensualité du crédit", "600")}
                ${input("charges", "Charges de copropriété", "100")}
                ${input("assurance", "Assurance PNO", "20")}
                ${input("taxes", "Taxe foncière mensualisée", "100")}
                ${input("frais", "Frais divers", "30")}
            `,

            button: "Calculer mon cashflow",

            action: "calculerCashflow()"
        },


        regle70: {
            icon: "🔥",
            title: "Règle des 70",
            description: "Vérifie rapidement si ta mensualité reste cohérente avec tes loyers.",

            fields: `
                ${input("mensualite", "Mensualité du crédit", "700")}
                ${input("loyers", "Loyers nets mensuels", "1000")}
            `,

            button: "Vérifier mon projet",

            action: "calculerRegle70()"
        },


        endettement: {
            icon: "📊",
            title: "Taux d'endettement",
            description: "Calcule le poids de tes charges par rapport à tes revenus.",

            fields: `
                ${input("charges", "Charges mensuelles", "800")}
                ${input("revenu", "Revenu net mensuel", "2500")}
            `,

            button: "Calculer mon taux",

            action: "calculerEndettement()"
        },


        mensualite: {
            icon: "💳",
            title: "Mensualité maximale",
            description: "Estime la mensualité maximale théorique selon tes revenus.",

            fields: `
                ${input("revenu", "Revenus nets mensuels", "2500")}
                ${input("charge", "Crédits en cours", "300")}
            `,

            button: "Calculer ma mensualité",

            action: "calculerMensualite()"
        },


        capital: {
            icon: "👏",
            title: "Capital maximal",
            description: "Estime le montant maximal d'emprunt selon ta formule actuelle.",

            fields: `
                ${input("salaire", "Salaire net mensuel", "2500")}
                ${input("mois", "Durée du prêt", "240", "mois")}
            `,

            button: "Estimer mon capital",

            action: "calculerCapital()"
        }
    };


    const data = calculators[type];

    html = `
        <div class="calculator-box">

            <div class="calculator-header">

                <div class="calculator-icon">
                    ${data.icon}
                </div>

                <div>
                    <span class="calculator-category">
                        CALCULATEUR IMMOBILIER
                    </span>

                    <h2>${data.title}</h2>

                    <p class="calculator-description">
                        ${data.description}
                    </p>
                </div>

            </div>


            <div class="form-grid">
                ${data.fields}
            </div>


            <button
                class="calculate-button"
                onclick="${data.action}"
            >
                ${data.button}
                <span>→</span>
            </button>


            <div id="result"></div>

        </div>
    `;


    calculator.innerHTML = html;

    calculatorSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });


    setTimeout(() => {

        const firstInput =
            calculator.querySelector("input");

        if (firstInput) {
            firstInput.focus();
        }

    }, 350);
}


/* =========================
   VALEURS
========================= */

function getValue(id) {

    const element =
        document.getElementById(id);

    if (!element) return 0;

    return Number(element.value);
}


/* =========================
   VALIDATION
========================= */

function validate(...values) {

    return values.every(
        value => Number.isFinite(value) && value >= 0
    );
}


function positive(value) {
    return Number.isFinite(value) && value > 0;
}


/* =========================
   RESULTAT
========================= */

function afficherResultat(
    title,
    value,
    message = "",
    type = "normal"
) {

    const result =
        document.getElementById("result");

    if (!result) return;


    let colorClass = "";

    if (type === "positive") {
        colorClass = "result-positive";
    }

    if (type === "negative") {
        colorClass = "result-negative";
    }

    if (type === "warning") {
        colorClass = "result-warning";
    }


    result.innerHTML = `

        <div class="result ${colorClass}">

            <div class="result-title">
                ${title}
            </div>

            <div class="result-value">
                ${value}
            </div>

            ${
                message
                    ? `
                        <div class="result-message">
                            ${message}
                        </div>
                    `
                    : ""
            }

        </div>
    `;


    result.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
}


/* =========================
   ERREUR
========================= */

function afficherErreur(message) {

    const result =
        document.getElementById("result");

    if (!result) return;


    result.innerHTML = `

        <div class="result result-error">

            <div class="result-title">
                Attention
            </div>

            <div class="result-message">
                ⚠️ ${message}
            </div>

        </div>
    `;
}


/* =========================
   RENTABILITÉ BRUTE
========================= */

function calculerBrute() {

    const loyer = getValue("loyer");
    const prix = getValue("prix");


    if (!positive(prix)) {

        afficherErreur(
            "Le prix du bien doit être supérieur à 0."
        );

        return;
    }


    const total =
        (loyer / prix) * 100;


    let message;

    if (total >= 8) {
        message = "🔥 Très belle rentabilité brute.";
    }
    else if (total >= 6) {
        message = "✨ Rentabilité brute intéressante.";
    }
    else if (total >= 4) {
        message = "👍 Rentabilité correcte.";
    }
    else {
        message = "💡 Pense à comparer avec les autres opportunités.";
    }


    afficherResultat(
        "Rentabilité brute",
        `${number.format(total)} %`,
        message
    );
}


/* =========================
   RENTABILITÉ NETTE
========================= */

function calculerNette() {

    const loyer = getValue("loyer");
    const charges = getValue("charges");
    const taxes = getValue("taxes");
    const frais = getValue("frais");
    const prix = getValue("prix");


    if (!positive(prix)) {

        afficherErreur(
            "Le prix du bien doit être supérieur à 0."
        );

        return;
    }


    const revenuNet =
        loyer -
        charges -
        taxes -
        frais;


    const total =
        (revenuNet / prix) * 100;


    let message;

    if (total >= 7) {
        message = "🔥 Très belle rentabilité nette.";
    }
    else if (total >= 5) {
        message = "✨ Projet potentiellement intéressant.";
    }
    else if (total >= 3) {
        message = "👍 Rentabilité à analyser plus en détail.";
    }
    else {
        message = "⚠️ Rentabilité nette assez faible.";
    }


    afficherResultat(
        "Rentabilité nette",
        `${number.format(total)} %`,
        message
    );
}


/* =========================
   CASHFLOW
========================= */

function calculerCashflow() {

    const loyers = getValue("loyers");
    const mensualite = getValue("mensualite");
    const charges = getValue("charges");
    const assurance = getValue("assurance");
    const taxes = getValue("taxes");
    const frais = getValue("frais");


    const total =
        loyers -
        (
            mensualite +
            charges +
            assurance +
            taxes +
            frais
        );


    if (total > 0) {

        afficherResultat(
            "Cashflow mensuel",
            money.format(total),
            "🤑 Ton investissement génère un cashflow positif !",
            "positive"
        );

    }
    else if (total < 0) {

        afficherResultat(
            "Cashflow mensuel",
            money.format(total),
            "🔴 Le projet demande un effort mensuel.",
            "negative"
        );

    }
    else {

        afficherResultat(
            "Cashflow mensuel",
            money.format(total),
            "⚖️ Ton investissement est à l'équilibre."
        );
    }
}


/* =========================
   RÈGLE DES 70
========================= */

function calculerRegle70() {

    const mensualite =
        getValue("mensualite");

    const loyers =
        getValue("loyers");


    const limite =
        loyers * 0.70;


    if (mensualite <= limite) {

        afficherResultat(
            "Résultat",
            "OK ✓",
            `Ta mensualité de ${money.format(mensualite)} reste sous la limite de ${money.format(limite)}.`,
            "positive"
        );

    }
    else {

        afficherResultat(
            "Résultat",
            "Attention",
            `La limite calculée est de ${money.format(limite)}.`,
            "warning"
        );
    }
}


/* =========================
   ENDETTEMENT
========================= */

function calculerEndettement() {

    const charges =
        getValue("charges");

    const revenu =
        getValue("revenu");


    if (!positive(revenu)) {

        afficherErreur(
            "Le revenu doit être supérieur à 0."
        );

        return;
    }


    const total =
        (charges / revenu) * 100;


    let message;

    if (total <= 35) {
        message = "🟢 Sous le seuil de 35 %.";
    }
    else {
        message = "⚠️ Au-dessus de 35 %.";
    }


    afficherResultat(
        "Taux d'endettement",
        `${number.format(total)} %`,
        message,
        total <= 35
            ? "positive"
            : "warning"
    );
}


/* =========================
   MENSUALITÉ MAX
========================= */

function calculerMensualite() {

    const revenu =
        getValue("revenu");

    const charge =
        getValue("charge");


    const total =
        (revenu * 0.35) - charge;


    afficherResultat(
        "Mensualité maximale",
        money.format(total),
        total > 0
            ? "💳 Voici l'estimation selon ta formule."
            : "⚠️ Tes charges actuelles dépassent le seuil calculé.",
        total > 0
            ? "positive"
            : "negative"
    );
}


/* =========================
   CAPITAL MAXIMAL
========================= */

function calculerCapital() {

    const salaire =
        getValue("salaire");

    const mois =
        getValue("mois");


    if (!positive(mois)) {

        afficherErreur(
            "La durée du prêt doit être supérieure à 0."
        );

        return;
    }


    const total =
        (salaire * 0.35 * mois) / 1.4;


    afficherResultat(
        "Capital maximal estimé",
        money.format(total),
        "🏠 Estimation basée sur ta formule actuelle."
    );
}


/* =========================
   RETOUR
========================= */

function closeCalculator() {

    calculatorSection.classList.add("hidden");

    calculator.innerHTML = "";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================
   ENTER = CALCULER
========================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter" &&
            event.target.tagName === "INPUT"
        ) {

            const button =
                calculator.querySelector(
                    ".calculate-button"
                );

            if (button) {
                button.click();
            }
        }
    }
);
