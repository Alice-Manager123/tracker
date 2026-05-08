import { ClerkProvider, SignedIn, SignedOut, UserButton, RedirectToSignIn } from "@clerk/nextjs";

export const metadata = { title: "Invoice & Quote Tracker" };

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f9fafb" }}>
          <SignedIn>
            <header style={{
              background: "#fff", borderBottom: "1px solid #e5e7eb",
              padding: "12px 24px", display: "flex",
              justifyContent: "space-between", alignItems: "center"
            }}>
              <span style={{ fontWeight: 600, fontSize: 16 }}>📋 Invoice & Quote Tracker</span>
              <UserButton afterSignOutUrl="/sign-in" />
            </header>
            <main style={{ padding: "24px" }}>{children}</main>
          </SignedIn>
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
        </body>
      </html>
    </ClerkProvider>
  );
}