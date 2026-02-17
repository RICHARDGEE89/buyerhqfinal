import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Privacy Policy | BuyerHQ",
};

export default function PrivacyPage() {
    return (
        <div className="bg-white min-h-screen pt-40 pb-24">
            <div className="container mx-auto px-6 max-w-3xl space-y-12">
                <header className="space-y-4">
                    <h1 className="text-5xl font-display font-black text-midnight">Privacy <span className="text-teal">Policy.</span></h1>
                    <p className="text-stone font-mono font-bold uppercase tracking-widest text-xs">Last Updated: February 2024</p>
                </header>

                <div className="prose prose-stone max-w-none space-y-8 text-midnight">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-display font-black tracking-tight">1. Introduction</h2>
                        <p className="font-medium leading-relaxed">BuyerHQ (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your privacy. This policy explains how we collect, use, and protect your personal data when you use our property directory services.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-display font-black tracking-tight">2. Information We Collect</h2>
                        <p className="font-medium leading-relaxed">We collect information that you voluntarily provide when using our services, including:</p>
                        <ul className="list-disc pl-6 space-y-2 font-medium">
                            <li>Contact details (Name, Email, Phone)</li>
                            <li>Property requirements (Budget, Suburb, Property Type)</li>
                            <li>Usage data (How you interact with our directory)</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-display font-black tracking-tight">3. Use of Information</h2>
                        <p className="font-medium leading-relaxed">We use your information to facilitate matches with buyer&apos;s agents and to improve our platform experience. We never sell your personal data to third-party marketing companies.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
