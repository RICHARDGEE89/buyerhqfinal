import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BuyerHQ | Find Your Perfect Buyer's Agent",
    template: "%s | BuyerHQ"
  },
  description: "Australia's premier directory for verified buyer's agents. Transparent, trustworthy, and free for buyers.",
  keywords: ["buyer's agent", "property search", "real estate australia", "buyers advocate", "property investment"],
  authors: [{ name: "BuyerHQ Team" }],
  creator: "BuyerHQ",
  publisher: "BuyerHQ",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://buyerhq.com.au'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "BuyerHQ | Find Your Perfect Buyer's Agent",
    description: "Australia's premier directory for verified buyer's agents. Transparent, trustworthy, and free for buyers.",
    url: 'https://buyerhq.com.au',
    siteName: 'BuyerHQ',
    locale: 'en_AU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "BuyerHQ | Find Your Perfect Buyer's Agent",
    description: "Australia's premier directory for verified buyer's agents. Transparent, trustworthy, and free for buyers.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} font-sans antialiased bg-white text-midnight`}
      >
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}


