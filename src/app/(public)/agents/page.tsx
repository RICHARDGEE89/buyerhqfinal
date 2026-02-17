import React from 'react';
import { Metadata } from 'next';
import AgentsClientOnly from './AgentsClientOnly';

export const metadata: Metadata = {
    title: "Find a Buyer's Agent | Verified Directory",
    description: "Search and filter Australia's most comprehensive directory of verified buyer's agents. Find the perfect advocate for your property journey.",
};

export default function AgentsPage() {
    return <AgentsClientOnly />;
}
