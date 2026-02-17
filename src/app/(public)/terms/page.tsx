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
                    <h1 className="text-5xl font-display font-black text-gray-900">Terms of <span className="text-primary">Service.</span></h1>
                    <p className="text-stone font-mono font-bold uppercase tracking-widest text-xs">Last Updated: February 2026</p>
                </header>

                <div className="prose prose-stone max-w-none space-y-8 text-gray-900 leading-relaxed text-lg">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-display font-black tracking-tight text-gray-900">1. Agreement to Terms</h2>
                        <p>These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity (&quot;you&quot;) and BuyerHQ (&quot;we,&quot; &quot;us&quot; or &quot;our&quot;), concerning your access to and use of the BuyerHQ website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the &quot;Site&quot;).</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-display font-black tracking-tight text-gray-900">2. Directory Services</h2>
                        <p>BuyerHQ serves as a directory and verification service for buyer&apos;s agents. We are not a real estate agency, financial advisor, or legal entity. We do not provide property advice. Any engagement you enter into with an agent listed on our platform is strictly between you and that agent.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-display font-black tracking-tight text-gray-900">3. User Representations</h2>
                        <p>By using the Site, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information; (3) you have the legal capacity and you agree to comply with these Terms of Service.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-display font-black tracking-tight text-gray-900">4. Limitation of Liability</h2>
                        <p>In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the site.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-display font-black tracking-tight text-gray-900">5. Governing Law</h2>
                        <p>These terms shall be governed by and defined following the laws of Australia. BuyerHQ and yourself irrevocably consent that the courts of Australia shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these terms.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
