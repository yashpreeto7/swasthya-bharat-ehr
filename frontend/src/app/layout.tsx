import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MedIndia HealthOS — Unified Indian EHR Platform",
  description: "ABDM-aligned EHR Prototype featuring FHIR R4, SNOMED CT, Consent-Gated Access Control, and Grounded AI Clinical Copilot",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="sovereign-manifesto">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400&family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased selection:bg-[#d42b2b] selection:text-white">
        {children}
      </body>
    </html>
  );
}
