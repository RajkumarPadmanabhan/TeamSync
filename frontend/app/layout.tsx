import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TeamSync - Enterprise Project & Task Management Suite",
  description: "MNC Team Project and Task Management Application built with Next.js and Django REST API.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full bg-slate-950 text-slate-100 dark">
      <body className={`${inter.className} min-h-full flex flex-col bg-slate-950 antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
