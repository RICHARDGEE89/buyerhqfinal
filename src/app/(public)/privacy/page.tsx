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
                    <h1 className="text-5xl font-display font-black text-gray-900">Privacy <span className="text-primary">Policy.</span></h1>
                    <p className="text-stone font-mono font-bold uppercase tracking-widest text-xs">Last Updated: February 2026</p>
                </header>

                <div className="prose prose-stone max-w-none space-y-8 text-gray-900 leading-relaxed text-lg">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-display font-black tracking-tight text-gray-900">1. Introduction</h2>
                        <p>BuyerHQ (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) respects your privacy and is committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-display font-black tracking-tight text-gray-900">2. Data We Collect</h2>
                        <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
                            <li><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
                            <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform on the devices you use to access this website.</li>
                            <li><strong>Usage Data:</strong> includes information about how you use our website, products and services.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-display font-black tracking-tight text-gray-900">3. How We Use Your Data</h2>
                        <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>To match you with verified buyer&apos;s agents.</li>
                            <li>To manage our relationship with you.</li>
                            <li>To improve our website, products/services, marketing or customer relationships.</li>
                            <li>To recommend services which may be of interest to you.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-display font-black tracking-tight text-gray-900">4. Data Security</h2>
                        <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-display font-black tracking-tight text-gray-900">5. Your Legal Rights</h2>
                        <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, or to object to processing.</p>
                    </section>

                    <section className="space-y-4 border-t border-gray-200 pt-8 mt-12">
                        <p className="text-sm text-gray-500">
                            If you have any questions about this privacy policy or our privacy practices, please contact us at: <a href="mailto:privacy@buyerhq.com.au" className="text-primary hover:underline font-bold">privacy@buyerhq.com.au</a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
