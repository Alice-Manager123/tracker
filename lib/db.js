import { neon } from "@neondatabase/serverless";

const getSQL = () => {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  return neon(process.env.DATABASE_URL);
};

export async function setupDB() {
  const sql = getSQL();
  await sql`CREATE TABLE IF NOT EXISTS columns (id SERIAL PRIMARY KEY, col_key TEXT NOT NULL UNIQUE, label TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'text', position INTEGER NOT NULL DEFAULT 0, locked BOOLEAN DEFAULT FALSE)`;
  await sql`CREATE TABLE IF NOT EXISTS rows (id SERIAL PRIMARY KEY, created_at TIMESTAMP DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS cells (id SERIAL PRIMARY KEY, row_id INTEGER REFERENCES rows(id) ON DELETE CASCADE, col_key TEXT NOT NULL, value TEXT, UNIQUE(row_id, col_key))`;
  await sql`CREATE TABLE IF NOT EXISTS email_recipients (id SERIAL PRIMARY KEY, type TEXT NOT NULL, email TEXT NOT NULL, UNIQUE(type, email))`;
  const rows = await sql`SELECT COUNT(*) FROM columns`;
  if (parseInt(rows[0].count) === 0) {
    const defaults = [["vendor","Vendor","text",0,true],["quoteAmount","Quote Amount","text",1,true],["quoteDate","Quote Date","date",2,true],["quotePDF","Quote","pdf",3,true],["quoteStatus","Status of Quote","quoteStatus",4,true],["poNumber","PO #","text",5,true],["invoiceNumber","Invoice Number","text",6,true],["invoiceDate","Invoice Date","date",7,true],["invoicePDF","Invoice","pdf",8,true],["invoiceStatus","Status of Invoice","invoiceStatus",9,true]];
    for (const [key, label, type, pos, locked] of defaults) {
      await sql`INSERT INTO columns (col_key, label, type, position, locked) VALUES (${key}, ${label}, ${type}, ${pos}, ${locked}) ON CONFLICT DO NOTHING`;
    }
  }
}
export async function getRows() { const sql = getSQL(); const rows = await sql`SELECT * FROM rows ORDER BY id`; const cells = await sql`SELECT * FROM cells`; return rows.map(r => ({ ...r, data: Object.fromEntries(cells.filter(c => c.row_id === r.id).map(c => [c.col_key, c.value])) })); }
export async function createRow() { const sql = getSQL(); const rows = await sql`INSERT INTO rows DEFAULT VALUES RETURNING *`; return { ...rows[0], data: {} }; }
export async function deleteRow(id) { const sql = getSQL(); await sql`DELETE FROM rows WHERE id = ${id}`; }
export async function upsertCell(rowId, colKey, value) { const sql = getSQL(); await sql`INSERT INTO cells (row_id, col_key, value) VALUES (${rowId}, ${colKey}, ${value}) ON CONFLICT (row_id, col_key) DO UPDATE SET value = EXCLUDED.value`; }
export async function getColumns() { const sql = getSQL(); return await sql`SELECT * FROM columns ORDER BY position`; }
export async function createColumn(label) { const sql = getSQL(); const key = `col_${Date.now()}`; const maxRows = await sql`SELECT MAX(position) AS max FROM columns`; const pos = (maxRows[0].max ?? 0) + 1; const rows = await sql`INSERT INTO columns (col_key, label, type, position, locked) VALUES (${key}, ${label}, 'text', ${pos}, false) RETURNING *`; return rows[0]; }
export async function renameColumn(id, label) { const sql = getSQL(); await sql`UPDATE columns SET label = ${label} WHERE id = ${id}`; }
export async function deleteColumn(id) { const sql = getSQL(); const rows = await sql`SELECT col_key, locked FROM columns WHERE id = ${id}`; if (!rows.length || rows[0].locked) return; await sql`DELETE FROM columns WHERE id = ${id}`; await sql`DELETE FROM cells WHERE col_key = ${rows[0].col_key}`; }
export async function getRecipients(type) { const sql = getSQL(); return await sql`SELECT * FROM email_recipients WHERE type = ${type}`; }
export async function addRecipient(type, email) { const sql = getSQL(); await sql`INSERT INTO email_recipients (type, email) VALUES (${type}, ${email}) ON CONFLICT DO NOTHING`; }
export async function deleteRecipient(id) { const sql = getSQL(); await sql`DELETE FROM email_recipients WHERE id = ${id}`; }

export async function getNextPONumber(prefix) {
  const sql = getSQL();
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, "0");
  const result = await sql`SELECT COUNT(*) FROM cells WHERE col_key = 'poNumber' AND value LIKE ${prefix + year + month + "%"}`;
  const num = parseInt(result[0].count) + 1;
  return prefix + year + month + "-" + String(num).padStart(3, "0");
}

export async function addPropertyColumn() {
  const sql = getSQL();
  await sql`UPDATE columns SET position = position + 1 WHERE col_key != 'property'`;
  await sql`INSERT INTO columns (col_key, label, type, position, locked) VALUES ('property', 'Property', 'property', 0, true) ON CONFLICT DO NOTHING`;
}
