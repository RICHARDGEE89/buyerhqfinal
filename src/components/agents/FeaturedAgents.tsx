import React from 'react';
import { AgentCard } from './AgentCard';
import { Agent } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const FeaturedAgents = () => {
    // Mock data for featured agents
    const featuredAgents = [
        {
            id: '1',
            slug: 'prestige-property-group',
            business_name: 'Prestige Property Group',
            primary_suburb: 'Double Bay',
            primary_state: 'NSW',
            licence_verified: true,
            years_experience: 15,
            specialisations: ['Luxury Homes', 'Off-Market Deals', 'Investment'],
            bio: "Sydney's leading luxury buyer's agency with over $2B in properties secured for our clients."
        },
        {
            id: '2',
            slug: 'melbourne-buyer-experts',
            business_name: 'Melbourne Buyer Experts',
            primary_suburb: 'Toorak',
            primary_state: 'VIC',
            licence_verified: true,
            years_experience: 12,
            specialisations: ['Family Homes', 'First Home Buyers', 'Auction Bidding'],
            bio: "We help Melbourne families find and secure their dream home without the typical real estate stress."
        },
        {
            id: '3',
            slug: 'sunshine-coast-advocates',
            business_name: 'Sunshine Coast Advocates',
            primary_suburb: 'Noosa Heads',
            primary_state: 'QLD',
            licence_verified: true,
            years_experience: 8,
            specialisations: ['Holiday Homes', 'Interstate Buyers', 'Development'],
            bio: "Local Sunshine Coast experts specializing in high-growth investment and premium lifestyle properties."
        }
    ];

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
                        <Button variant="ghost" className="text-ocean font-bold flex items-center gap-2 group">
                            Browse All Agents
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredAgents.map((agent) => (
                        <AgentCard key={agent.id} agent={agent as Partial<Agent>} />
                    ))}
                </div>
            </div>
        </section>
    );
};
