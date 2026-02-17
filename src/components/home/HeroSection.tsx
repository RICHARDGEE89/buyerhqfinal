"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { SearchBar } from './SearchBar';
import { BadgeCheck, Sparkles } from 'lucide-react';

export const HeroSection = () => {
    return (
        <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 overflow-hidden bg-white">
            {/* Animated Glow Backdrops - Subtle Grey */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gray-100/50 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-gray-50/50 rounded-full blur-[140px] animate-pulse delay-700" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-5xl mx-auto text-center">
                    {/* Trust Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 border border-gray-200 text-gray-900 text-sm font-bold tracking-tight mb-8"
                    >
                        <BadgeCheck className="w-4 h-4 mr-2 text-gray-600 fill-transparent" />
                        Australia&apos;s Verified Buyer&apos;s Agent Directory
                    </motion.div>

                    {/* H1 */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-5xl md:text-8xl font-display font-black tracking-tight text-gray-900 leading-[0.9] mb-8"
                    >
                        Find Your Perfect <br className="hidden md:block" />
                        <span className="text-gray-600">Buyer&apos;s Agent.</span>
                    </motion.h1>

                    {/* P */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed font-medium"
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
                                <div key={i} className="w-12 h-12 rounded-2xl border-2 border-white bg-gray-100 flex items-center justify-center font-display font-black text-xs text-gray-900">
                                    BHQ
                                </div>
                            ))}
                        </div>
                        <div className="text-left">
                            <div className="flex items-center gap-1 text-gray-900 mb-1">
                                {[1, 2, 3, 4, 5].map((s) => <Sparkles key={s} className="w-3 h-3 fill-gray-900 text-gray-900" />)}
                            </div>
                            <p className="text-gray-500 text-xs font-mono font-bold uppercase tracking-[0.2em] leading-tight">
                                &quot;The best decision we made in our property journey.&quot;
                                <br />
                                <span className="text-gray-900">— Sarah &amp; David, Bondi</span>
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
