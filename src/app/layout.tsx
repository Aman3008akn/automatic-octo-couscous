import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { SessionProvider } from "@/components/providers/session-provider";

export const metadata: Metadata = {
  title: "Cartigo — Verified Reseller Marketplace",
  description: "The trusted reseller-only marketplace for verified products.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700;800&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-paper text-ink font-body flex flex-col antialiased">
        <SessionProvider>
          <Header />
          <div className="flex-1">{children}</div>
          <footer className="border-t border-line bg-paper py-8 text-center text-xs text-navy-400">
            <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <p>© {new Date().getFullYear()} Cartigo Marketplace Inc. All rights reserved.</p>
              <div className="flex items-center gap-6 text-navy-600 font-medium">
                <span>Authenticity Guaranteed</span>
                <span>Verified Resellers Only</span>
                <span>Protected Payments</span>
              </div>
            </div>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
