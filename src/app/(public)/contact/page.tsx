import React from 'react';
import ContactContent from './ContactContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Contact Us | BuyerHQ Support",
    description: "Get in touch with the BuyerHQ team. Whether you're a buyer seeking advice or an agent wanting to join our verified directory.",
};

export default function ContactPage() {
    return <ContactContent />;
}
