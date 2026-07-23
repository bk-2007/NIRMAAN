import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nirmaan | Enterprise Hackathon Evaluation Platform",
  description:
    "Real-time, enterprise-grade hackathon evaluation platform with role-based dashboards, live room leaderboards, locked scoring, and PDF/Excel exports.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0F172A] text-slate-100 antialiased selection:bg-orange-500 selection:text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
