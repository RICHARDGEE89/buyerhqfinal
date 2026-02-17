import React from 'react';
import { AgentCard } from './AgentCard';
import { Agent } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const FeaturedAgents = () => {
    // Purged mock data - Ready for Supabase fetch or user listings
    const featuredAgents: any[] = [];

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
                    <div className="space-y-4 max-w-2xl">
                        <h2 className="text-3xl md:text-5xl font-display font-black text-midnight tracking-tight">
                            Meet Our Verified Agents
                        </h2>
                        <p className="text-stone font-medium text-lg leading-relaxed">
                            Every agent on our platform has been manually vetted for licensing and experience.
                        </p>
                    </div>
                    <Link href="/agents">
                        <Button variant="ghost" className="text-teal font-bold flex items-center gap-2 group">
                            Browse All Agents
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredAgents.length > 0 ? (
                        featuredAgents.map((agent) => (
                            <AgentCard key={agent.id} agent={agent as Partial<Agent>} />
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center bg-warm/30 rounded-[3rem] border-2 border-dashed border-stone/10">
                            <p className="text-stone font-bold italic">Checking for newly verified experts...</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};
