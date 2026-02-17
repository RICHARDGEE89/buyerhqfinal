import React from 'react';
import { MessageSquare, UserCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const steps = [
    {
        title: 'Tell Us What You Need',
        desc: "Define your budget, preferred suburbs, and property type to find the best match.",
        icon: MessageSquare,
        color: 'bg-primary'
    },
    {
        title: 'Browse Verified Agents',
        desc: "Compare local experts with verified licences and real buyer reviews.",
        icon: UserCheck,
        color: 'bg-indigo-600'
    },
    {
        title: 'Connect and Buy with Confidence',
        desc: "Enquire directly, compare agents, and secure your next home or investment.",
        icon: CheckCircle2,
        color: 'bg-verified'
    }
];

export const HowItWorks = () => {
    return (
        <section className="py-24 bg-warm">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-display font-black text-gray-900 tracking-tight">
                        How BuyerHQ Works
                    </h2>
                    <p className="text-stone font-medium text-lg leading-relaxed">
                        Getting professional property help is simpler than you think.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {steps.map((step, i) => (
                        <div
                            key={i}
                            className="relative p-10 bg-white rounded-[2.5rem] shadow-soft border border-stone/5 group hover:-translate-y-2 transition-transform duration-500"
                        >
                            <div className={`w-14 h-14 ${step.color} rounded-2xl flex items-center justify-center text-white shadow-lg mb-8 group-hover:scale-110 transition-transform duration-500`}>
                                <step.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-display font-black text-gray-900 mb-4">
                                {step.title}
                            </h3>
                            <p className="text-stone font-medium leading-relaxed">
                                {step.desc}
                            </p>

                            {/* Connector line for desktop */}
                            {i < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-1/2 -right-4 translate-x-1/2 z-10">
                                    <ArrowRight className="w-6 h-6 text-stone/20" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <Link href="/get-matched">
                        <Button className="bg-primary hover:bg-primary/90 text-white font-bold h-14 px-10 rounded-2xl shadow-xl shadow-teal/20 transition-all active:scale-95 text-lg">
                            Take the Match Quiz
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </Link>
                    <p className="mt-4 text-stone/40 text-xs font-mono uppercase tracking-widest">
                        No sign-up required • Takes 2 minutes
                    </p>
                </div>
            </div>
        </section>
    );
};
