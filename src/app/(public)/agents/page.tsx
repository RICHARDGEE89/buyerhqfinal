import React from 'react';
import { AgentSearchHeader } from '@/components/agents/AgentSearchHeader';
import { FilterSidebar } from '@/components/agents/FilterSidebar';
import { AgentCard } from '@/components/agents/AgentCard';
import { Agent } from '@/types';
import { Button } from '@/components/ui/button';
import { Grid, List, Map as MapIcon, Search } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Find a Buyer's Agent | Verified Directory",
    description: "Search and filter Australia's most comprehensive directory of verified buyer's agents. Find the perfect advocate for your property journey.",
};

export default function AgentsPage() {
    // Purged mock data - Ready for high-quality verified listings
    const agents: any[] = [];

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
                                {agents.length > 0 ? (
                                    agents.map((agent) => (
                                        <AgentCard key={agent.id} agent={agent as Partial<Agent>} />
                                    ))
                                ) : (
                                    <div className="col-span-full py-32 text-center bg-warm/30 rounded-[3rem] border-2 border-dashed border-stone/10">
                                        <div className="w-20 h-20 bg-teal/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-teal">
                                            <Search className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-xl font-display font-black text-midnight mb-2">Expanding Our Network</h3>
                                        <p className="text-stone font-medium max-w-sm mx-auto">
                                            We're currently verifying property experts in this area. Check back soon for the best professional representation.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Pagination Placeholder */}
                            <div className="pt-12 flex justify-center">
                                <Button variant="outline" className="rounded-full border-stone/20 font-bold px-12 h-12 hover:bg-white hover:border-teal transition-all">
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
