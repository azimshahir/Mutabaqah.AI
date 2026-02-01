import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Fiqh Hackathon Bank Rakyat 2026 | Mutabaqah.AI",
  description: "AI-Driven Shariah-Compliant Islamic Finance Solutions - Bank Rakyat Hackathon 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
