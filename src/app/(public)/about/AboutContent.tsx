"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Heart, Eye, Users, Scale, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const values = [
    {
        title: 'Buyer-First Focus',
        desc: "We exist to balance the scales. While traditional agents work for sellers, we find and verify the experts who work exclusively for you.",
        icon: Heart,
        color: 'text-primary bg-primary/10'
    },
    {
        title: 'Rigorous Verification',
        desc: "We manually verify every agent's licence, ABN, and experience before they are listed on our directory.",
        icon: ShieldCheck,
        color: 'text-verified bg-verified/10'
    },
    {
        title: 'Total Transparency',
        desc: "Honest reviews and clear performance data help you make informed decisions without the typical real estate bias.",
        icon: Eye,
        color: 'text-primary bg-primary/10'
    }
];

export default function AboutContent() {
    return (
        <div className="bg-white min-h-screen">
            {/* Hero */}
            {/* Hero */}
            <section className="pt-40 pb-24 bg-white relative">
                <div className="container mx-auto px-6 text-center space-y-6 max-w-4xl">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-display font-black text-gray-900 tracking-tight leading-tight"
                    >
                        The Agent Directory <br className="hidden md:block" />
                        Designed for <span className="text-primary">Buyers.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed"
                    >
                        BuyerHQ was built to solve a single problem: finding a trustworthy, local buyer&apos;s agent shouldn&apos;t be a guessing game.
                    </motion.p>
                </div>
            </section>

            {/* Values Grid */}
            <section className="py-32">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {values.map((value, i) => (
                            <motion.div
                                key={value.title}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 + 0.3 }}
                            >
                                <Card className="border-stone/10 rounded-[2.5rem] p-10 h-full hover:shadow-soft transition-all duration-500 hover:-translate-y-2 group">
                                    <CardContent className="p-0 space-y-8">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${value.color} group-hover:scale-110 transition-transform`}>
                                            <value.icon className="w-8 h-8" />
                                        </div>
                                        <div className="space-y-4">
                                            <h3 className="text-2xl font-display font-black text-gray-900 tracking-tight">
                                                {value.title}
                                            </h3>
                                            <p className="text-stone font-medium leading-relaxed">
                                                {value.desc}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Philosophy Section */}
            <section className="py-32 bg-warm">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center max-w-6xl mx-auto">
                        <div className="space-y-8">
                            <h2 className="text-4xl md:text-5xl font-display font-black text-gray-900 tracking-tight leading-tight">
                                Balancing the Scales of <br />
                                <span className="text-primary">Property Buying.</span>
                            </h2>
                            <p className="text-lg text-stone font-medium leading-relaxed">
                                Founded in 2024, BuyerHQ was born from a simple realization: the Australian property market is heavily weighted in the seller&apos;s favor. We&apos;re here to change that by putting power back into the buyer&apos;s hands.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 flex-shrink-0 w-6 h-6 bg-verified/10 rounded-full flex items-center justify-center text-verified">
                                        <Scale className="w-3.5 h-3.5" />
                                    </div>
                                    <p className="text-gray-900 font-bold">Bridging the expertise gap between buyers and sellers.</p>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 flex-shrink-0 w-6 h-6 bg-verified/10 rounded-full flex items-center justify-center text-verified">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                    </div>
                                    <p className="text-gray-900 font-bold">Standardising verification for the buyer&apos;s advocacy industry.</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="aspect-square bg-white rounded-[4rem] shadow-2xl overflow-hidden relative group border border-stone/5">
                                <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-midnight to-transparent text-white pt-20">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Users className="w-5 h-5 text-primary" />
                                        <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Independent & Reliable</span>
                                    </div>
                                    <p className="text-xl font-display font-black leading-tight">
                                        &quot;We don&apos;t just find houses; we secure dreams.&quot; — The BuyerHQ Philosophy.
                                    </p>
                                </div>
                            </div>
                            {/* Decorative Accent */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-[60px] -z-10" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="py-24 bg-white border-t border-stone/5">
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto space-y-8 text-center">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 text-primary text-xs font-bold uppercase tracking-widest">
                            Our Story
                        </div>
                        <h2 className="text-4xl md:text-5xl font-display font-black text-gray-900 tracking-tight">
                            From Frustration to <span className="text-primary">Solution.</span>
                        </h2>
                        <div className="space-y-6 text-lg text-gray-500 leading-relaxed font-medium text-left">
                            <p>
                                The idea for BuyerHQ wasn&apos;t born in a boardroom. It started at a crowded open home in Sydney, watching frustrated families being outmaneuvered by professional selling agents.
                            </p>
                            <p>
                                We realized that while sellers have expert representation, most buyers are left to navigate the most complex financial decision of their lives alone. We asked ourselves: <em>&quot;Where do buyers go to find someone on their side?&quot;</em>
                            </p>
                            <p>
                                The answer was nowhere. The industry was fragmented, with no central directory of verified, independent advocates. So, we built one.
                            </p>
                            <p>
                                Today, BuyerHQ is Australia&apos;s only dedicated marketplace for verified buyer&apos;s agents. We are obsessed with transparency, integrity, and leveling the playing field for property buyers across the nation.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
