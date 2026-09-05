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
    <html lang="en">
      <body className="antialiased selection:bg-teal-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
