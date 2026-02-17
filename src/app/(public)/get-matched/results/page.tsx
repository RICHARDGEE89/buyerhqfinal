"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { AgentCard } from '@/components/agents/AgentCard';
import { Agent } from '@/types';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, RefreshCcw, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function MatchResultsPage() {
    // In a real app, we'd fetch these based on the quiz ID or direct results
    // Purged mock results - Ready for algorithmic matching
    const mockResults: Partial<Agent>[] = [];

    return (
        <div className="min-h-screen pt-32 pb-20 bg-white">
            <div className="container mx-auto px-6">

                {/* Header */}
                <div className="max-w-4xl mx-auto text-center space-y-6 mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-gray-900 text-xs font-black uppercase tracking-widest border border-gray-200"
                    >
                        <Sparkles className="w-4 h-4 fill-transparent text-primary" />
                        Professional Matches
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-display font-black text-gray-900 tracking-tight"
                    >
                        We&apos;ve Found Your <br />
                        <span className="text-primary">Perfect Experts.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
                    >
                        Based on your budget and target location, these agents are best positioned to secure your next property.
                    </motion.p>
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {mockResults.length > 0 ? (
                        mockResults.map((agent, i) => (
                            <motion.div
                                key={agent.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + i * 0.1 }}
                                className="relative"
                            >
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 bg-white text-gray-900 px-6 py-2 rounded-2xl border-2 border-primary font-mono font-black text-xs shadow-xl flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-primary" />
                                    {agent.match_score}% MATCH
                                </div>
                                <AgentCard agent={agent as Partial<Agent>} className="h-full pt-4" />
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                            <h3 className="text-xl font-display font-black text-gray-900 mb-2">Sourcing Top Talent...</h3>
                            <p className="text-gray-500 font-medium max-w-sm mx-auto">
                                We&apos;re currently matching your requirements with our newest verified agents.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer CTAs */}
                {/* Footer CTAs */}
                <div className="mt-24 flex flex-col items-center gap-8">
                    <div className="flex flex-col sm:flex-row gap-6">
                        <Link href="/get-matched">
                            <Button variant="outline" className="h-16 px-10 rounded-[2rem] border-gray-200 text-gray-900 font-bold hover:bg-gray-50 hover:text-gray-900 transition-all">
                                <RefreshCcw className="w-4 h-4 mr-2" />
                                Redo Match Quiz
                            </Button>
                        </Link>
                        <Link href="/agents">
                            <Button className="h-16 px-12 bg-gray-900 text-white font-black rounded-[2rem] shadow-2xl hover:bg-primary hover:text-white transition-all text-lg">
                                Browse More Agents
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                    </div>
                    <p className="text-gray-400 text-[10px] font-mono font-bold uppercase tracking-[0.2em]">
                        No obligation to enquire • Free service for buyers
                    </p>
                </div>

            </div>
        </div>
    );
}
