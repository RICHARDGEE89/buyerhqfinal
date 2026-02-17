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
    const mockResults = [
        {
            id: '1',
            slug: 'prestige-property-group',
            business_name: 'Prestige Property Group',
            primary_suburb: 'Double Bay',
            primary_state: 'NSW',
            licence_verified: true,
            years_experience: 15,
            specialisations: ['Luxury Homes', 'Off-Market Deals'],
            bio: "Sydney's leading luxury buyer's agency with over $2B in properties secured for our clients.",
            match_score: 98
        },
        {
            id: '2',
            slug: 'melbourne-buyer-experts',
            business_name: 'Melbourne Buyer Experts',
            primary_suburb: 'Bondi', // Mocked match for Bondi search
            primary_state: 'NSW',
            licence_verified: true,
            years_experience: 12,
            specialisations: ['Family Homes', 'Auction Bidding'],
            bio: "Local experts who specialize in finding family homes in the Eastern Suburbs.",
            match_score: 92
        },
        {
            id: '3',
            slug: 'brisbane-buying-pros',
            business_name: 'Bondi Buying Pros',
            primary_suburb: 'Bondi',
            primary_state: 'NSW',
            licence_verified: true,
            years_experience: 10,
            specialisations: ['Investment Strategy', 'First Home Buyers'],
            bio: "Boutique agency focused on finding high-growth investment properties for our clients.",
            match_score: 85
        }
    ];

    return (
        <div className="min-h-screen pt-32 pb-20 bg-topo">
            <div className="container mx-auto px-6">

                {/* Header */}
                <div className="max-w-4xl mx-auto text-center space-y-6 mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 bg-ocean/10 px-4 py-2 rounded-full text-ocean text-xs font-black uppercase tracking-widest border border-ocean/20"
                    >
                        <Sparkles className="w-4 h-4 fill-ocean" />
                        Top 3 Professional Matches
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-display font-black text-white tracking-tight"
                    >
                        We&apos;ve Found Your <br />
                        <span className="text-ocean">Perfect Experts.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-sky/60 max-w-2xl mx-auto leading-relaxed"
                    >
                        Based on your budget and target location, these agents are best positioned to secure your next property.
                    </motion.p>
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {mockResults.map((agent, i) => (
                        <motion.div
                            key={agent.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            className="relative"
                        >
                            {/* Match Score Label */}
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 bg-midnight text-white px-6 py-2 rounded-2xl border-2 border-ocean font-mono font-black text-xs shadow-xl flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-ocean" />
                                {agent.match_score}% MATCH
                            </div>
                            <AgentCard agent={agent as Partial<Agent>} className="h-full pt-4" />
                        </motion.div>
                    ))}
                </div>

                {/* Footer CTAs */}
                <div className="mt-24 flex flex-col items-center gap-8">
                    <div className="flex flex-col sm:flex-row gap-6">
                        <Link href="/get-matched">
                            <Button variant="outline" className="h-16 px-10 rounded-[2rem] border-sky/20 text-white font-bold hover:bg-white hover:text-midnight transition-all">
                                <RefreshCcw className="w-4 h-4 mr-2" />
                                Redo Match Quiz
                            </Button>
                        </Link>
                        <Link href="/agents">
                            <Button className="h-16 px-12 bg-white text-midnight font-black rounded-[2rem] shadow-2xl hover:bg-ocean hover:text-white transition-all text-lg">
                                Browse More Agents
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                    </div>
                    <p className="text-sky/40 text-[10px] font-mono font-bold uppercase tracking-[0.2em]">
                        No obligation to enquire • Free service for buyers
                    </p>
                </div>

            </div>
        </div>
    );
}
