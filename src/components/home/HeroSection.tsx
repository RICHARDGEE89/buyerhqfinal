"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { SearchBar } from './SearchBar';
import { BadgeCheck, Sparkles } from 'lucide-react';

export const HeroSection = () => {
    return (
        <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 overflow-hidden bg-topo">
            {/* Animated Glow Backdrops */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-teal/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-teal/10 rounded-full blur-[140px] animate-pulse delay-700" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-5xl mx-auto text-center">
                    {/* Trust Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 text-teal text-sm font-bold tracking-tight mb-8 backdrop-blur-sm"
                    >
                        <BadgeCheck className="w-4 h-4 mr-2 text-verified fill-verified/20" />
                        Australia&apos;s Verified Buyer&apos;s Agent Directory
                    </motion.div>

                    {/* H1 */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-5xl md:text-8xl font-display font-black tracking-tight text-white leading-[0.9] mb-8"
                    >
                        Find Your Perfect <br className="hidden md:block" />
                        <span className="text-teal">Buyer&apos;s Agent.</span>
                    </motion.h1>

                    {/* P */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xl md:text-2xl text-teal/40 mb-12 max-w-2xl mx-auto leading-relaxed font-medium"
                    >
                        The intelligent way to find your next property. We match you with Australia&apos;s most successful, verified buyer&apos;s agents.
                    </motion.p>

                    {/* Search Bar Component */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="mb-16"
                    >
                        <SearchBar />
                    </motion.div>

                    {/* Secondary Trust Signal */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12"
                    >
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-12 h-12 rounded-2xl border-2 border-midnight bg-warm flex items-center justify-center font-display font-black text-xs text-midnight">
                                    BHQ
                                </div>
                            ))}
                        </div>
                        <div className="text-left">
                            <div className="flex items-center gap-1 text-amber mb-1">
                                {[1, 2, 3, 4, 5].map((s) => <Sparkles key={s} className="w-3 h-3 fill-amber" />)}
                            </div>
                            <p className="text-white/40 text-xs font-mono font-bold uppercase tracking-[0.2em] leading-tight">
                                &quot;The best decision we made in our property journey.&quot;
                                <br />
                                <span className="text-teal">— Sarah &amp; David, Bondi</span>
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
