"use client";
import { useState, useEffect, useRef } from "react";

const QUOTE_STATUSES = ["", "Awaiting Approval", "Approved"];
const INVOICE_STATUSES = ["", "Awaiting Approval", "Approved"];
const STATUS_STYLE = {
  "Awaiting Approval": { background: "#fef3c7", color: "#92400e" },
  "Approved": { background: "#d1fae5", color: "#065f46" },
  "": { background: "transparent", color: "#6b7280" },
};

const api = (url, opts = {}) =>
  fetch(url, { headers: { "Content-Type": "application/json" }, ...opts }).then(r => r.json());

export default function Tracker() {
  const [rows, setRows] = useState([]);
  const [cols, setCols] = useState([]);
  const [quoteEmails, setQEmails] = useState([]);
  const [invEmails, setIEmails] = useState([]);
  const [showSettings, setSettings] = useState(false);
  const [newCol, setNewCol] = useState("");
  const [newQEmail, setNQEmail] = useState("");
  const [newIEmail, setNIEmail] = useState("");
  const [editCol, setEditCol] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [uploading, setUploading] = useState({});

  const load = async () => {
    const [r, c, qe, ie] = await Promise.all([
      api("/api/rows"),
      api("/api/columns"),
      api("/api/emails/recipients?type=quote"),
      api("/api/emails/recipients?type=invoice"),
    ]);
    setRows(r); setCols(c); setQEmails(qe); setIEmails(ie);
  };
  useEffect(() => { load(); }, []);

  const addRow = async () => {
    const row = await api("/api/rows", { method: "POST" });
    setRows(p => [...p, row]);
  };

  const deleteRow = async (id) => {
    await api("/api/rows/" + id, { method: "DELETE" });
    setRows(p => p.filter(r => r.id !== id));
  };

  const updateCell = async (rowId, colKey, value, rowData) => {
    setRows(p => p.map(r => r.id === rowId ? { ...r, data: { ...r.data, [colKey]: value } } : r));
    await api("/api/rows/" + rowId, { method: "PATCH", body: JSON.stringify({ colKey, value }) });
    if (colKey === "quoteStatus" && value === "Awaiting Approval") {
      await api("/api/emails/send", { method: "POST", body: JSON.stringify({ type: "quote", rowId, poNumber: rowData["poNumber"] || "" }) });
    }
    if (colKey === "invoiceStatus" && value === "Awaiting Approval") {
      await api("/api/emails/send", { method: "POST", body: JSON.stringify({ type: "invoice", rowId, invoiceNumber: rowData["invoiceNumber"] || "" }) });
    }
  };

  const addCol = async () => {
    if (!newCol.trim()) return;
    const col = await api("/api/columns", { method: "POST", body: JSON.stringify({ label: newCol.trim() }) });
    setCols(p => [...p, col]); setNewCol("");
  };

  const deleteCol = async (id) => {
    await api("/api/columns/" + id, { method: "DELETE" });
    setCols(p => p.filter(c => c.id !== id));
  };

  const saveColName = async () => {
    if (editVal.trim()) {
      await api("/api/columns/" + editCol, { method: "PATCH", body: JSON.stringify({ label: editVal.trim() }) });
      setCols(p => p.map(c => c.id === editCol ? { ...c, label: editVal.trim() } : c));
    }
    setEditCol(null);
  };

  const addEmail = async (type, email, setter) => {
    if (!email.trim()) return;
    await api("/api/emails/recipients", { method: "POST", body: JSON.stringify({ type, email: email.trim() }) });
    setter(p => [...p, { type, email: email.trim(), id: Date.now() }]);
    type === "quote" ? setNQEmail("") : setNIEmail("");
  };

  const deleteEmail = async (id, setter) => {
    await api("/api/emails/recipients", { method: "DELETE", body: JSON.stringify({ id }) });
    setter(p => p.filter(e => e.id !== id));
  };

  const handlePDF = async (rowId, colKey, file) => {
    if (!file) return;
    const key = rowId + "_" + colKey;
    setUploading(p => ({ ...p, [key]: true }));
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (data.url) {
        setRows(p => p.map(r => r.id === rowId ? { ...r, data: { ...r.data, [colKey]: data.url } } : r));
        await api("/api/rows/" + rowId, { method: "PATCH", body: JSON.stringify({ colKey, value: data.url }) });
      } else {
        alert("Upload failed: " + (data.error || "unknown error"));
      }
    } catch (e) {
      alert("Upload error: " + e.message);
    }
    setUploading(p => ({ ...p, [key]: false }));
  };

  const th = { border: "0.5px solid #e5e7eb", padding: "8px 10px", fontSize: 12, fontWeight: 500, color: "#6b7280", background: "#f9fafb", textAlign: "left", whiteSpace: "nowrap" };
  const td = { border: "0.5px solid #e5e7eb", padding: 0, verticalAlign: "middle", background: "#fff", minWidth: 120 };
  const inp = { width: "100%", border: "none", outline: "none", padding: "7px 9px", fontSize: 13, background: "transparent", boxSizing: "border-box" };

  const EmailList = ({ label, list, setter, inputVal, setInput, type }) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        <input value={inputVal} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addEmail(type, inputVal, setter)}
          placeholder="Add email..." style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 10px", fontSize: 13 }} />
        <button onClick={() => addEmail(type, inputVal, setter)}
          style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, padding: "5px 14px", cursor: "pointer", fontSize: 13 }}>Add</button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {list.map(e => (
          <span key={e.id} style={{ display: "flex", alignItems: "center", gap: 4, background: "#f3f4f6", borderRadius: 20, padding: "3px 10px", fontSize: 12 }}>
            {e.email}
            <button onClick={() => deleteEmail(e.id, setter)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#6b7280" }}>x</button>
          </span>
        ))}
        {!list.length && <span style={{ fontSize: 12, color: "#9ca3af" }}>No recipients yet.</span>}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontWeight: 600, fontSize: 16 }}>Tracker</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={addRow} style={{ border: "1px solid #e5e7eb", borderRadius: 7, background: "#fff", padding: "6px 14px", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>+ Add Row</button>
          <button onClick={() => setSettings(s => !s)} style={{ border: "1px solid #e5e7eb", borderRadius: 7, background: showSettings ? "#f3f4f6" : "#fff", padding: "6px 14px", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>Settings</button>
        </div>
      </div>

      {showSettings && (
        <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: 18, marginBottom: 18 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Email Recipients</div>
          <EmailList label="Quote approval emails" list={quoteEmails} setter={setQEmails} inputVal={newQEmail} setInput={setNQEmail} type="quote" />
          <EmailList label="Invoice approval emails" list={invEmails} setter={setIEmails} inputVal={newIEmail} setInput={setNIEmail} type="invoice" />
          <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 14, marginTop: 8 }}>
            <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 8 }}>Add custom column</div>
            <div style={{ display: "flex", gap: 6 }}>
              <input value={newCol} onChange={e => setNewCol(e.target.value)} onKeyDown={e => e.key === "Enter" && addCol()}
                placeholder="Column name..." style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 10px", fontSize: 13 }} />
              <button onClick={addCol} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, padding: "5px 14px", cursor: "pointer", fontSize: 13 }}>Add</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #e5e7eb" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
          <thead>
            <tr>
              {cols.map(col => (
                <th key={col.id} style={th}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {editCol === col.id ? (
                      <input autoFocus value={editVal} onChange={e => setEditVal(e.target.value)}
                        onBlur={saveColName} onKeyDown={e => e.key === "Enter" && saveColName()}
                        style={{ border: "1px solid #e5e7eb", borderRadius: 4, padding: "2px 6px", fontSize: 12, width: 100 }} />
                    ) : (
                      <span onDoubleClick={() => { setEditCol(col.id); setEditVal(col.label); }}>{col.label}</span>
                    )}
                    {!col.locked && (
                      <button onClick={() => deleteCol(col.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 14, padding: "0 2px" }}>x</button>
                    )}
                  </div>
                </th>
              ))}
              <th style={{ ...th, width: 36 }} />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={row.id} style={{ background: ri % 2 === 0 ? "#fff" : "#fafafa" }}>
                {cols.map(col => {
                  const val = row.data[col.col_key] || "";
                  const colKey = col.col_key;
                  if (col.type === "quoteStatus" || col.type === "invoiceStatus") {
                    const opts = col.type === "quoteStatus" ? QUOTE_STATUSES : INVOICE_STATUSES;
                    return (
                      <td key={col.id} style={{ ...td, minWidth: 160 }}>
                        <select value={val} onChange={e => updateCell(row.id, colKey, e.target.value, row.data)}
                          style={{ ...inp, cursor: "pointer", ...(STATUS_STYLE[val] || {}) }}>
                          {opts.map(o => <option key={o} value={o}>{o || "Select"}</option>)}
                        </select>
                      </td>
                    );
                  }
                  if (col.type === "pdf") {
                    const key = row.id + "_" + colKey;
                    const isUploading = uploading[key];
                    return (
                      <td key={col.id} style={{ ...td, minWidth: 140 }}>
                        <div style={{ padding: "5px 8px", display: "flex", alignItems: "center", gap: 6 }}>
                          {val
                            ? <a href={val} onClick={(e)} => { e.preventDefault(); const w = window.open(); w.document.write('<iframe width=100% height=100% src=' + val + '></iframe>'); }} style={{ fontSize: 12, color: "#2563eb", maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>View PDF</a>
                            : <span style={{ fontSize: 12, color: "#9ca3af" }}>{isUploading ? "Uploading..." : "No file"}</span>}
                          <label style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 4, padding: "2px 7px", fontSize: 11, cursor: "pointer", color: "#6b7280" }}>
                            {isUploading ? "..." : val ? "Change" : "Attach"}
                            <input type="file" accept=".pdf" style={{ display: "none" }}
                              onChange={e => { if (e.target.files[0]) handlePDF(row.id, colKey, e.target.files[0]); }} />
                          </label>
                        </div>
                      </td>
                    );
                  }
                  if (col.type === "date") {
                    return (
                      <td key={col.id} style={{ ...td, minWidth: 140 }}>
                        <input type="date" value={val} onChange={e => updateCell(row.id, colKey, e.target.value, row.data)} style={inp} />
                      </td>
                    );
                  }
                  return (
                    <td key={col.id} style={td}>
                      <input value={val} onChange={e => updateCell(row.id, colKey, e.target.value, row.data)} style={inp} placeholder="" />
                    </td>
                  );
                })}
                <td style={{ ...td, textAlign: "center", width: 36 }}>
                  <button onClick={() => deleteRow(row.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 16, padding: "4px 8px" }}>x</button>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan={cols.length + 1} style={{ textAlign: "center", padding: 32, color: "#9ca3af", fontSize: 14 }}>No rows yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <button onClick={addRow} style={{ marginTop: 10, border: "1px solid #e5e7eb", borderRadius: 7, background: "#fff", padding: "5px 14px", cursor: "pointer", fontSize: 13, color: "#6b7280" }}>+ Add Row</button>
    </div>
  );
}


