import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Terms of Service | BuyerHQ",
};

export default function TermsPage() {
    return (
        <div className="bg-white min-h-screen pt-40 pb-24">
            <div className="container mx-auto px-6 max-w-3xl space-y-12">
                <header className="space-y-4">
                    <h1 className="text-5xl font-display font-black text-midnight">Terms of <span className="text-teal">Service.</span></h1>
                    <p className="text-stone font-mono font-bold uppercase tracking-widest text-xs">Last Updated: February 2024</p>
                </header>

                <div className="prose prose-stone max-w-none space-y-8 text-midnight">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-display font-black tracking-tight">1. Acceptance of Terms</h2>
                        <p className="font-medium leading-relaxed">By accessing or using BuyerHQ, you agree to be bound by these Terms of Service. If you do not agree, please do not use our directory.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-display font-black tracking-tight">2. Service Description</h2>
                        <p className="font-medium leading-relaxed">BuyerHQ provides a directory of buyer&apos;s agents. We are an independent platform and do not provide property advice or brokerage services ourselves.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-display font-black tracking-tight">3. Agent Verification</h2>
                        <p className="font-medium leading-relaxed">While we manually verify licences and ABNs, BuyerHQ does not guarantee the performance or suitability of any agent. Users are encouraged to conduct their own due diligence before signing any agreements.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
