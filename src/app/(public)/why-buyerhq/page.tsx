import React from 'react';
import { Metadata } from 'next';
import { ShieldCheck, Scale, Award, Zap, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export const metadata: Metadata = {
    title: "Why BuyerHQ? | Australia's Premier Buyer's Agent Directory",
    description: "Discover why property buyers trust BuyerHQ. Manual verification, independent ratings, and a buyer-first philosophy.",
};

export default function WhyBuyerHQPage() {
    const pillars = [
        {
            title: "Manual Verification",
            desc: "We don't rely on algorithms. We manually audit licences and ABNs to ensure every agent is legit.",
            icon: ShieldCheck,
            color: "text-primary bg-primary/10"
        },
        {
            title: "Zero Referral Fees",
            desc: "We don't take a cut of the agent's commission. This keeps their advice honest and unbiased.",
            icon: Scale,
            color: "text-verified bg-verified/10"
        },
        {
            title: "Expertise Only",
            desc: "Only agents with proven track records and local expertise are allowed on our platform.",
            icon: Award,
            color: "text-gray-900 bg-gray-900/10"
        }
    ];

    return (
        <div className="bg-white min-h-screen">
            <section className="pt-40 pb-24 bg-white relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10 space-y-8 max-w-4xl text-center">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 border border-gray-200 text-primary text-xs font-bold uppercase tracking-widest">
                        The BuyerHQ Advantage
                    </div>
                    <h1 className="text-5xl md:text-7xl font-display font-black text-gray-900 tracking-tight leading-tight">
                        Built for <span className="text-primary">Integrity.</span> <br />
                        Designed for <span className="text-primary">You.</span>
                    </h1>
                    <p className="text-xl text-gray-500 leading-relaxed mx-auto max-w-2xl">
                        In an industry dominated by seller-focused portals, we built a sanctuary for property buyers.
                    </p>
                </div>
            </section>

            <section className="py-32">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {pillars.map((pillar, i) => (
                            <Card key={i} className="border-stone/5 rounded-[2.5rem] p-10 bg-white shadow-soft group hover:-translate-y-2 transition-all duration-500">
                                <CardContent className="p-0 space-y-8">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${pillar.color} group-hover:scale-110 transition-transform`}>
                                        <pillar.icon className="w-8 h-8" />
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-2xl font-display font-black text-gray-900 tracking-tight">{pillar.title}</h3>
                                        <p className="text-stone font-medium leading-relaxed italic">&quot;{pillar.desc}&quot;</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-24 bg-gray-50 border-t border-stone/5">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-6">
                            <h2 className="text-4xl font-display font-black text-gray-900 tracking-tight">The difference <br /> is <span className="text-primary">Verification.</span></h2>
                            <p className="text-stone font-medium leading-relaxed">Most directories list anyone who pays. We list everyone who is verified. Our strict criteria ensure you only ever deal with legitimate, high-performing professionals.</p>
                            <ul className="space-y-4">
                                {[
                                    "Licence & ABN Audited",
                                    "Years of Experience Verified",
                                    "Geographic Specialties Checked",
                                    "Unbiased Reviews Only"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-900 font-bold">
                                        <CheckCircle2 className="w-5 h-5 text-primary" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-stone/5 space-y-8">
                            <h4 className="text-xl font-display font-black text-gray-900">Ready to find your expert?</h4>
                            <p className="text-stone font-medium leading-relaxed">It takes less than 2 minutes to get matched with your ideal local expert.</p>
                            <Link href="/get-matched">
                                <Button className="w-full bg-primary text-white font-black h-16 rounded-2xl flex items-center justify-center text-lg shadow-xl shadow-teal/20">
                                    Match Me Now <Zap className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
