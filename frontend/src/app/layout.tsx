import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Swasthya Bharat EHR — Unified Indian Healthcare Platform",
  description: "ABDM-aligned National EHR Platform featuring FHIR R4, SNOMED CT, Consent-Gated Access Control, and Grounded AI Clinical Copilot",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased selection:bg-indigo-600 selection:text-white min-h-screen text-slate-900 dark:text-slate-100 relative overflow-x-hidden">
        {/* Ambient Medical Template Wallpaper from Directory */}
        <div className="medical-template-bg" aria-hidden="true" />
        <div className="medical-template-overlay" aria-hidden="true" />
        <div className="relative z-10 flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
