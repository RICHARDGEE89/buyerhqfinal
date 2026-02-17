import React from 'react';
import AboutContent from './AboutContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "About BuyerHQ | Our Standards & Mission",
    description: "Learn how BuyerHQ is balancing the scales of property buying in Australia. We verify buyer's agents so you don't have to.",
};

export default function AboutPage() {
    return <AboutContent />;
}
