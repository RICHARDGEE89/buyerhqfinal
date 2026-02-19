import type { Metadata } from "next";
import localFont from "next/font/local";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { StickyBuyerCtaBar } from "@/components/layout/StickyBuyerCtaBar";
import { AuthProvider } from "@/context/AuthContext";

import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-primary",
  weight: "100 900",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-mono",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BuyerHQ | Australia's Verified Buyer's Agent Directory",
  description:
    "Find verified buyer's agents across Australia. Compare specialists and submit brokered enquiries managed by BuyerHQ.",
  metadataBase: new URL("https://buyerhq.com.au"),
  openGraph: {
    title: "BuyerHQ | Australia's Verified Buyer's Agent Directory",
    description:
      "Find verified buyer's agents across Australia with brokered, client-focused introductions.",
    siteName: "BuyerHQ",
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BuyerHQ",
    description: "Australia's verified buyer's agent directory with brokered introductions.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <AuthProvider>
          <Header />
          <main className="min-h-screen bg-background text-text-primary">{children}</main>
          <StickyBuyerCtaBar />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
