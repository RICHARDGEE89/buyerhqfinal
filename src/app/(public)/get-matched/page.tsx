import React from 'react';
import MatchQuizContent from './MatchQuizContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Get Matched | Find Your Perfect Buyer's Agent",
    description: "Take our 2-minute quiz to find the perfect verified buyer's agent for your property journey. Free and impartial matches based on your goals.",
};

export default function MatchQuizPage() {
    return <MatchQuizContent />;
}
