import Database from "better-sqlite3";

const db = new Database('./invoices.sqlite');

db.prepare(`CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  issuer_name TEXT,
  issuer_address TEXT,
  issuer_tax_number TEXT,
  buyer_name TEXT,
  buyer_address TEXT,
  buyer_tax_number TEXT,
  invoice_number TEXT UNIQUE,
  invoice_date DATE,
  completion_date DATE,
  payment_deadline DATE,
  total_amount REAL,
  vat REAL,
  status TEXT DEFAULT 'Aktív' -- Új státusz mező
)`).run();


export const getAllInvoices = () => db.prepare(`SELECT * FROM invoices`).all();
export const getInvoiceById = (id) => db.prepare(`SELECT * FROM invoices WHERE id = ?`).get(id);
export const updateInvoice = (id, issuer_name, issuer_address, issuer_tax_number, buyer_name, buyer_address, buyer_tax_number, invoice_number, invoice_date, completion_date, payment_deadline, total_amount, vat) => 
    db.prepare(`UPDATE invoices SET issuer_name = ?, issuer_address = ?, issuer_tax_number = ?, buyer_name = ?, buyer_address = ?, buyer_tax_number = ?, invoice_number = ?, invoice_date = ?, completion_date = ?, payment_deadline = ?, total_amount = ?, vat = ? WHERE id = ?`)
      .run(issuer_name, issuer_address, issuer_tax_number, buyer_name, buyer_address, buyer_tax_number, invoice_number, invoice_date, completion_date, payment_deadline, total_amount, vat, id);
export const deleteInvoice = (id) => db.prepare(`DELETE FROM invoices WHERE id = ?`).run(id);
export const getAllIssuers = () => db.prepare(`SELECT DISTINCT issuer_name AS name, issuer_address AS address, issuer_tax_number AS tax_number FROM invoices`).all();
export const createInvoice = (issuer_name, issuer_address, issuer_tax_number, buyer_name, buyer_address, buyer_tax_number, invoice_number, invoice_date, completion_date, payment_deadline, total_amount, vat) => 
  db.prepare(`INSERT INTO invoices (issuer_name, issuer_address, issuer_tax_number, buyer_name, buyer_address, buyer_tax_number, invoice_number, invoice_date, completion_date, payment_deadline, total_amount, vat, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(issuer_name, issuer_address, issuer_tax_number, buyer_name, buyer_address, buyer_tax_number, invoice_number, invoice_date, completion_date, payment_deadline, total_amount, vat, 'Aktív');
export const stornoInvoice = (id) => 
  db.prepare(`UPDATE invoices SET status = 'Sztornózva' WHERE id = ?`).run(id);

const invoices = [
  {
    issuer_name: "Tech Solutions Ltd.",
    issuer_address: "Budapest, Fő utca 12.",
    issuer_tax_number: "HU12345678",
    buyer_name: "Green Energy Kft.",
    buyer_address: "Szeged, Kossuth tér 5.",
    buyer_tax_number: "HU87654321",
    invoice_number: "INV-2025-001",
    invoice_date: "2025-04-10",
    completion_date: "2025-04-15",
    payment_deadline: "2025-05-10",
    total_amount: 125000,
    vat: 27
  },
  {
    issuer_name: "Digital Web Agency",
    issuer_address: "Debrecen, Nagyerdei körút 8.",
    issuer_tax_number: "HU23456789",
    buyer_name: "Creative Media Kft.",
    buyer_address: "Pécs, Király utca 20.",
    buyer_tax_number: "HU98765432",
    invoice_number: "INV-2025-002",
    invoice_date: "2025-05-01",
    completion_date: "2025-05-02",
    payment_deadline: "2025-06-01",
    total_amount: 98000,
    vat: 27
  },
  {
    issuer_name: "Smart Home Systems",
    issuer_address: "Győr, Baross út 15.",
    issuer_tax_number: "HU34567890",
    buyer_name: "Comfort Living Zrt.",
    buyer_address: "Miskolc, Széchenyi tér 9.",
    buyer_tax_number: "HU76543210",
    invoice_number: "INV-2025-003",
    invoice_date: "2025-06-10",
    completion_date: "2025-06-15",
    payment_deadline: "2025-07-10",
    total_amount: 175000,
    vat: 27
  },
  {
    issuer_name: "Healthy Life Solutions",
    issuer_address: "Veszprém, Jókai utca 4.",
    issuer_tax_number: "HU45678901",
    buyer_name: "VitalCare Bt.",
    buyer_address: "Eger, Bajcsy-Zsilinszky utca 6.",
    buyer_tax_number: "HU65432109",
    invoice_number: "INV-2025-004",
    invoice_date: "2025-07-15",
    completion_date: "2025-07-20",
    payment_deadline: "2025-08-15",
    total_amount: 150000,
    vat: 27
  },
  {
    issuer_name: "EcoTech Innovations",
    issuer_address: "Székesfehérvár, Kossuth utca 10.",
    issuer_tax_number: "HU56789012",
    buyer_name: "Green Future Zrt.",
    buyer_address: "Nyíregyháza, Szent István tér 7.",
    buyer_tax_number: "HU54321098",
    invoice_number: "INV-2025-005",
    invoice_date: "2025-08-05",
    completion_date: "2025-08-10",
    payment_deadline: "2025-09-05",
    total_amount: 220000,
    vat: 27
  }
];
for (const invoice of invoices) createInvoice(invoice.issuer_name, invoice.issuer_address, invoice.issuer_tax_number, invoice.buyer_name, invoice.buyer_address, invoice.buyer_tax_number, invoice.invoice_number, invoice.invoice_date, invoice.completion_date, invoice.payment_deadline,invoice.total_amount,invoice.vat)