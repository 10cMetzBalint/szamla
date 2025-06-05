const API_URL = "http://localhost:8080/invoices";

// Számlák betöltése és megjelenítése
const loadInvoices = async () => {
    const response = await fetch(API_URL);
    const invoices = await response.json();
    const tbody = document.querySelector("#invoiceTable tbody");
    tbody.innerHTML = "";

    invoices.forEach(invoice => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${invoice.invoice_number}</td>
            <td>${invoice.issuer_name}</td>
            <td>${invoice.buyer_name}</td>
            <td>
                <button onclick="showInvoiceDetails(${invoice.id})">📜 Megjelenítés</button>
                <button onclick="stornoInvoice(${invoice.id})">❌ Sztornó</button>
            </td>
        `;

        // Ha a számla státusza "Sztornózva", akkor megtartjuk a piros háttér és fehér szöveget
        if (invoice.status === "Sztornózva") {
            row.style.backgroundColor = "red";
            row.style.color = "white";
        }

        tbody.appendChild(row);
    });
};


// Számla adatok megjelenítése
const showInvoiceDetails = async (id) => {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) {
            throw new Error("Hiba a számla lekérésekor!");
        }
        
        const invoice = await response.json();

        document.getElementById("invoiceHeader").innerText = `Számla: ${invoice.invoice_number}`;
        document.getElementById("issuer_name").innerText = invoice.issuer_name;
        document.getElementById("issuer_address").innerText = invoice.issuer_address;
        document.getElementById("issuer_tax_number").innerText = `Adószám: ${invoice.issuer_tax_number}`;
        document.getElementById("buyer_name").innerText = invoice.buyer_name;
        document.getElementById("buyer_address").innerText = invoice.buyer_address;
        document.getElementById("buyer_tax_number").innerText = `Adószám: ${invoice.buyer_tax_number}`;
        document.getElementById("invoice_date").innerText = invoice.invoice_date;
        document.getElementById("completion_date").innerText = invoice.completion_date;
        document.getElementById("payment_deadline").innerText = invoice.payment_deadline;
        document.getElementById("total_amount").innerText = invoice.total_amount;
        document.getElementById("vat").innerText = invoice.vat;
        document.getElementById("gross_amount").innerText = invoice.total_amount * (1 + invoice.vat / 100);

        // Ha a számla sztornózva lett, megjelenítjük a "❌ Sztornózva" üzenetet
        const invoiceDetailsDiv = document.getElementById("invoiceDetails");
        if (invoice.status === "Sztornózva") {
            const stornoMessage = document.createElement("p");
            stornoMessage.innerText = "❌ Sztornózva";
            stornoMessage.style.color = "red";
            invoiceDetailsDiv.appendChild(stornoMessage);
        }

        invoiceDetailsDiv.style.display = "block";

    } catch (error) {
        console.error("Hiba történt a számla megjelenítésénél:", error);
    }
};


document.getElementById("invoiceForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const new_invoice_date = document.getElementById("new_invoice_date").value;

    // Automatikusan kiszámítja a fizetési határidőt (30 nappal később)
    const invoiceDateObj = new Date(new_invoice_date);
    const new_payment_deadline = new Date(invoiceDateObj);
    new_payment_deadline.setDate(invoiceDateObj.getDate() + 30); // +30 nap
    const formattedDeadline = new_payment_deadline.toISOString().split('T')[0]; // YYYY-MM-DD formátum

    const invoiceData = {
        issuer_name: document.getElementById("new_issuer_name").value,
        issuer_address: document.getElementById("new_issuer_address").value,
        issuer_tax_number: document.getElementById("new_issuer_tax_number").value,

        buyer_name: document.getElementById("new_buyer_name").value,
        buyer_address: document.getElementById("new_buyer_address").value,
        buyer_tax_number: document.getElementById("new_buyer_tax_number").value,

        invoice_number: document.getElementById("new_invoice_number").value,
        invoice_date: new_invoice_date,
        payment_deadline: formattedDeadline, // Automatikusan beállított dátum
        completion_date: document.getElementById("new_completion_date").value,

        total_amount: document.getElementById("new_total_amount").value,
        vat: document.getElementById("new_vat").value
    };

    console.log("Elküldött adatok:", invoiceData); // 📌 Ellenőrzés konzolon

    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData)
    });

    if (!response.ok) {
        const errorMessage = await response.text();
        console.error("Hiba történt:", errorMessage);
        alert(`Hiba a számla hozzáadásánál: ${errorMessage}`);
        return;
    }

    event.target.reset();
    loadInvoices();
});

const loadIssuers = async () => {
    try {
        const response = await fetch("http://localhost:8080/issuers"); // API végpont helyesen megadva
        if (!response.ok) {
            throw new Error("Hiba az API lekérésekor");
        }

        const issuers = await response.json();
        console.log("Kapott kiállítók:", issuers); // 📌 Ellenőrizd a konzolon

        const issuerSelect = document.getElementById("new_issuer_name");
        issuerSelect.innerHTML = '<option value="">Válassz kiállítót...</option>'; // Alapértelmezett opció

        issuers.forEach(issuer => {
            const option = document.createElement("option");
            option.value = issuer.name;
            option.textContent = issuer.name;
            option.dataset.address = issuer.address;
            option.dataset.tax_number = issuer.tax_number;
            issuerSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Hiba történt a kiállítók betöltésekor:", error);
    }
};

// Az oldal betöltésekor meghívjuk
window.addEventListener("load", loadIssuers);

const stornoInvoice = async (id) => {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) {
            throw new Error("Hiba a számla lekérésekor!");
        }

        const invoice = await response.json();

        await fetch(`${API_URL}/${id}/storno`, { method: "PUT" }); // Státusz frissítése az API-ban

        // Az űrlap mezőit kitöltjük az eredeti számla adataival
        document.getElementById("new_issuer_name").value = invoice.issuer_name;
        document.getElementById("new_issuer_address").value = invoice.issuer_address;
        document.getElementById("new_issuer_tax_number").value = invoice.issuer_tax_number;

        document.getElementById("new_buyer_name").value = invoice.buyer_name;
        document.getElementById("new_buyer_address").value = invoice.buyer_address;
        document.getElementById("new_buyer_tax_number").value = invoice.buyer_tax_number;

        document.getElementById("new_invoice_number").value = incrementInvoiceNumber(invoice.invoice_number);
        document.getElementById("new_invoice_date").value = invoice.invoice_date;
        document.getElementById("new_completion_date").value = invoice.completion_date;

        document.getElementById("new_total_amount").value = invoice.total_amount;
        document.getElementById("new_vat").value = invoice.vat;

        console.log("Sztornózott számla betöltve és státusz frissítve:", invoice);

        // **Eredeti számla sorának pirosra állítása fehér szöveggel**
        const invoiceRows = document.querySelectorAll("#invoiceTable tbody tr");
        invoiceRows.forEach(row => {
            if (row.cells[0].innerText.trim() === invoice.invoice_number) {
                row.style.backgroundColor = "red";
                row.style.color = "white";
            }
        });

    } catch (error) {
        console.error("Hiba történt a sztornózáskor:", error);
    }
};



// Számlaszám növelése
const incrementInvoiceNumber = (invoiceNumber) => {
    const num = invoiceNumber.match(/\d+$/); // Kinyerjük a számot a végéről
    if (!num) return invoiceNumber; // Ha nincs szám a végén, nem módosítunk

    const newNum = parseInt(num[0]) + 1; // Növeljük a számot 1-gyel
    return invoiceNumber.replace(num[0], newNum); // Kicseréljük az új számmal
};


const fillIssuerDetails = () => {
    const selectedOption = document.getElementById("new_issuer_name").selectedOptions[0];
    document.getElementById("new_issuer_address").value = selectedOption.dataset.address || "";
    document.getElementById("new_issuer_tax_number").value = selectedOption.dataset.tax_number || "";
};

window.addEventListener("load", loadInvoices);