import React from 'react';
import { Metadata } from 'next';
import { Search, UserCheck, MessageSquare, ShieldCheck, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
    title: "How It Works | BuyerHQ Buyer Guide",
    description: "Learn how to find and connect with verified buyer's agents in Australia. Your 3-step guide to a better property buying experience.",
};

export default function HowItWorksPage() {
    const steps = [
        {
            title: "1. Define Your Needs",
            desc: "Tell us about your property goals, budget, and target suburbs in less than 2 minutes.",
            icon: Zap,
            color: "text-teal bg-teal/10"
        },
        {
            title: "2. View Verified Matches",
            desc: "Our engine matches you with local experts who have been licence-verified and vetted by our team.",
            icon: ShieldCheck,
            color: "text-verified bg-verified/10"
        },
        {
            title: "3. Connect & Enquire",
            desc: "Compare profile data, read real reviews, and message your chosen agents directly. Completely free.",
            icon: MessageSquare,
            color: "text-midnight bg-midnight/10"
        }
    ];

    return (
        <div className="bg-white min-h-screen">
            {/* Hero */}
            <section className="pt-40 pb-24 bg-topo relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
                    <h1 className="text-5xl md:text-7xl font-display font-black text-white tracking-tight mb-8">
                        The Smarter Way <br />
                        to Find an <span className="text-teal">Agent.</span>
                    </h1>
                    <p className="text-xl text-white/60 leading-relaxed mb-12">
                        BuyerHQ is Australia&apos;s first truly independent directory designed to put the power back in the hands of property buyers.
                    </p>
                </div>
            </section>

            {/* Steps Section */}
            <section className="py-32">
                <div className="container mx-auto px-6">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                        {steps.map((step, i) => (
                            <div key={i} className="space-y-6 group">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${step.color} group-hover:scale-110 transition-transform duration-500`}>
                                    <step.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-display font-black text-midnight tracking-tight">
                                    {step.title}
                                </h3>
                                <p className="text-stone font-medium leading-relaxed italic">
                                    &quot;{step.desc}&quot;
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Independent */}
            <section className="py-24 bg-warm/50 border-y border-stone/5">
                <div className="container mx-auto px-6 max-w-4xl text-center space-y-8">
                    <h2 className="text-3xl md:text-5xl font-display font-black text-midnight tracking-tight">
                        Why Independence <span className="text-teal">Matters.</span>
                    </h2>
                    <p className="text-lg text-stone font-medium leading-relaxed">
                        Traditional real estate portals are built for sellers. We built BuyerHQ because we believe buyers deserve their own team of experts. We don&apos;t charge commissions, and we don&apos;t favour specific agencies. We just verify the best local talent and let you choose.
                    </p>
                    <div className="pt-8">
                        <Link href="/agents">
                            <Button className="bg-teal hover:bg-teal/90 text-white font-black h-16 px-12 rounded-2xl text-lg shadow-xl shadow-teal/20 transition-all active:scale-95">
                                Start Your Search
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
