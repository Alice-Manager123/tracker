import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata = { title: "Invoice & Quote Tracker" };

function Header() {
  return (
    <header style={{
      background: "#fff", borderBottom: "1px solid #e5e7eb",
      padding: "12px 24px", display: "flex",
      justifyContent: "space-between", alignItems: "center"
    }}>
      <span style={{ fontWeight: 600, fontSize: 16 }}>📋 Invoice & Quote Tracker</span>
    </header>
  );
}

export default async function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f9fafb" }}>
          <Header />
          <main style={{ padding: "24px" }}>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}