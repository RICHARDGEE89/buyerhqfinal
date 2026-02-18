import type { Metadata } from "next";

import ContactContent from "./ContactContent";

export const metadata: Metadata = {
  title: "Contact | BuyerHQ",
  description: "Contact BuyerHQ support for general, technical, or listing enquiries.",
};

export default function ContactPage() {
  return <ContactContent />;
}
