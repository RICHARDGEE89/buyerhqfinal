import type { Metadata } from "next";
import localFont from "next/font/local";

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
  icons: {
    icon: [{ url: "/icon", type: "image/png", sizes: "32x32" }],
    apple: [{ url: "/apple-icon", type: "image/png", sizes: "180x180" }],
    shortcut: ["/icon"],
  },
  manifest: "/manifest.webmanifest",
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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
