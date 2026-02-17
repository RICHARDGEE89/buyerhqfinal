import React from 'react';
import { AgentSearchHeader } from '@/components/agents/AgentSearchHeader';
import { FilterSidebar } from '@/components/agents/FilterSidebar';
import { AgentCard } from '@/components/agents/AgentCard';
import { Agent } from '@/types';
import { Button } from '@/components/ui/button';
import { Grid, List, Map as MapIcon } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Find a Buyer's Agent | Verified Directory",
    description: "Search and filter Australia's most comprehensive directory of verified buyer's agents. Find the perfect advocate for your property journey.",
};

export default function AgentsPage() {
    // Mock data for initial directory view
    const agents = [
        {
            id: '1',
            slug: 'prestige-property-group',
            business_name: 'Prestige Property Group',
            primary_suburb: 'Double Bay',
            primary_state: 'NSW',
            licence_verified: true,
            years_experience: 15,
            specialisations: ['Luxury Homes', 'Off-Market Deals'],
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
            specialisations: ['Family Homes', 'Auction Bidding'],
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
            specialisations: ['Holiday Homes', 'Interstate Buyers'],
            bio: "Local Sunshine Coast experts specializing in high-growth investment and premium lifestyle properties."
        },
        {
            id: '4',
            slug: 'brisbane-buying-pros',
            business_name: 'Brisbane Buying Pros',
            primary_suburb: 'New Farm',
            primary_state: 'QLD',
            licence_verified: true,
            years_experience: 10,
            specialisations: ['Investment Strategy', 'First Home Buyers'],
            bio: "Boutique agency focused on Brisbane's inner-ring high growth corridors."
        }
    ];

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <AgentSearchHeader />

            <section className="py-12 bg-white">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row gap-12">

                        {/* Sidebar (Filters) */}
                        <div className="w-full lg:w-80 shrink-0">
                            <FilterSidebar />
                        </div>

                        {/* Main Content (Results) */}
                        <div className="flex-1 space-y-8">

                            {/* Directory Controls */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-8 border-b border-stone/5">
                                <div className="text-stone font-bold text-sm uppercase tracking-widest">
                                    Showing <span className="text-midnight">{agents.length}</span> Verified Agents
                                </div>

                                <div className="flex items-center gap-2 bg-warm/30 p-1.5 rounded-2xl border border-stone/5">
                                    <Button variant="ghost" size="sm" className="bg-white shadow-sm rounded-xl h-9 px-4 text-midnight font-bold">
                                        <Grid className="w-4 h-4 mr-2" />
                                        Grid
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-stone hover:text-midnight rounded-xl h-9 px-4 font-bold">
                                        <List className="w-4 h-4 mr-2" />
                                        List
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-stone hover:text-midnight rounded-xl h-9 px-4 font-bold">
                                        <MapIcon className="w-4 h-4 mr-2" />
                                        Map
                                    </Button>
                                </div>
                            </div>

                            {/* Agent Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {agents.map((agent) => (
                                    <AgentCard key={agent.id} agent={agent as Partial<Agent>} />
                                ))}
                            </div>

                            {/* Pagination Placeholder */}
                            <div className="pt-12 flex justify-center">
                                <Button variant="outline" className="rounded-full border-stone/20 font-bold px-12 h-12 hover:bg-white hover:border-ocean transition-all">
                                    Load More Agents
                                </Button>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
}
