import express from 'express';
import * as db from './database.js';
import cors from 'cors';

const PORT = 8080;
const app = express();
app.use(express.json());
app.use(cors());

app.get("/invoices", (req, res) => {
    try {
        res.status(200).json(db.getAllInvoices());
    } catch (error) {
        res.status(500).json({ message: error.toString() });
    }
});

app.get("/issuers", (req, res) => {
    try {
        const issuers = db.getAllIssuers(); // Az adatbázisból lekéri az összes kiállítót
        res.status(200).json(issuers);
    } catch (error) {
        res.status(500).json({ message: error.toString() });
    }
});


app.get("/invoices/:id", (req, res) => {
    try {
        const invoice = db.getInvoiceById(req.params.id);
        if (!invoice) {
            return res.status(404).json({ message: "Számla nem található!" });
        }
        res.status(200).json(invoice);
    } catch (error) {
        console.error("Szerverhiba (GET /invoices/:id):", error);
        res.status(500).json({ message: error.toString() });
    }
});

app.post("/invoices", (req, res) => {
    try {
        const { issuer_name, issuer_address, issuer_tax_number, buyer_name, buyer_address, buyer_tax_number, invoice_number, invoice_date, completion_date, payment_deadline, total_amount, vat } = req.body;
        db.createInvoice(issuer_name, issuer_address, issuer_tax_number, buyer_name, buyer_address, buyer_tax_number, invoice_number, invoice_date, completion_date, payment_deadline, total_amount, vat);
        res.status(201).json({ message: "Számla létrehozva!" });
    } catch (error) {
        res.status(500).json({ message: error.toString() });
    }
});

app.put("/invoices/storno/:id", (req, res) => {
    try {
        const updatedInvoice = db.updateInvoiceStatus(req.params.id, "Sztornózva");
        if (!updatedInvoice.changes) {
            return res.status(422).json({ message: "Nem sikerült sztornózni!" });
        }
        res.status(200).json({ message: "Számla sztornózva!" });
    } catch (error) {
        console.error("Szerverhiba (PUT /invoices/storno/:id):", error);
        res.status(500).json({ message: error.toString() });
    }
});

app.put("/invoices/:id/storno", (req, res) => {
  try {
      db.stornoInvoice(req.params.id);
      res.status(200).json({ message: "Számla sztornózva" });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});


app.listen(PORT, () => console.log(`Szerver fut a ${PORT} porton`));