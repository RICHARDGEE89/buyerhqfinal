"use client";

import React from 'react';
import { AgentSearchHeader } from '@/components/agents/AgentSearchHeader';
import { FilterSidebar } from '@/components/agents/FilterSidebar';
import { AgentCard } from '@/components/agents/AgentCard';
import { Agent } from '@/types';
import { Button } from '@/components/ui/button';
import { Grid, List, Map as MapIcon, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AgentsClientOnly() {
    const [agents, setAgents] = React.useState<Partial<Agent>[]>([]);
    const [loading, setLoading] = React.useState(true);
    const supabase = React.useMemo(() => createClient(), []);

    React.useEffect(() => {
        const fetchAgents = async () => {
            const { data, error } = await supabase
                .from('agents')
                .select('*')
                .eq('subscription_status', 'active'); // Only show active agents

            if (error) {
                console.error('Error loading active agents', error);
            }

            if (data) {
                setAgents(data);
            }
            // Fallback for demo: if no active agents, show all for now so the user sees SOMETHING
            if (!data || data.length === 0) {
                const { data: allAgents, error: allAgentsError } = await supabase.from('agents').select('*');
                if (allAgentsError) {
                    console.error('Error loading all agents', allAgentsError);
                }
                if (allAgents) setAgents(allAgents);
            }
            setLoading(false);
        };
        fetchAgents();
    }, [supabase]);

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
                                    Showing <span className="text-gray-900">{agents.length}</span> Verified Agents
                                </div>

                                <div className="flex items-center gap-2 bg-warm/30 p-1.5 rounded-2xl border border-stone/5">
                                    <Button variant="ghost" size="sm" className="bg-white shadow-sm rounded-xl h-9 px-4 text-gray-900 font-bold">
                                        <Grid className="w-4 h-4 mr-2" />
                                        Grid
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-stone hover:text-gray-900 rounded-xl h-9 px-4 font-bold">
                                        <List className="w-4 h-4 mr-2" />
                                        List
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-stone hover:text-gray-900 rounded-xl h-9 px-4 font-bold">
                                        <MapIcon className="w-4 h-4 mr-2" />
                                        Map
                                    </Button>
                                </div>
                            </div>

                            {/* Agent Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {loading ? (
                                    <div className="col-span-full py-20 text-center text-stone font-bold">Loading directory...</div>
                                ) : agents.length > 0 ? (
                                    agents.map((agent) => (
                                        <AgentCard key={agent.id} agent={agent as Partial<Agent>} />
                                    ))
                                ) : (
                                    <div className="col-span-full py-32 text-center bg-warm/30 rounded-[3rem] border-2 border-dashed border-stone/10">
                                        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-primary">
                                            <Search className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-xl font-display font-black text-gray-900 mb-2">Expanding Our Network</h3>
                                        <p className="text-stone font-medium max-w-sm mx-auto">
                                            We&apos;re currently verifying property experts in this area. Check back soon for the best professional representation.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Pagination Placeholder */}
                            <div className="pt-12 flex justify-center">
                                <Button variant="outline" className="rounded-full border-stone/20 font-bold px-12 h-12 hover:bg-white hover:border-primary transition-all">
                                    Load More Agents
                                </Button>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Educational Content: How to Choose */}
            <section className="py-24 bg-gray-50 border-t border-stone/5">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl md:text-4xl font-display font-black text-gray-900 tracking-tight">
                            How to Choose the Right <span className="text-primary">Advocate.</span>
                        </h2>
                        <p className="text-lg text-gray-500 font-medium">
                            Not all buyer&apos;s agents are created equal. Here&apos;s what to look for.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center font-black text-primary shrink-0">1</div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg mb-2">Check for Independence</h3>
                                    <p className="text-gray-500 leading-relaxed text-sm">Ensure they effectively work only for you. Avoid agents who accept referral fees from selling agents or developers.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center font-black text-primary shrink-0">2</div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg mb-2">Verify Local Experience</h3>
                                    <p className="text-gray-500 leading-relaxed text-sm">Property markets vary by suburb. Choose an agent who has bought recently in your target area.</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center font-black text-primary shrink-0">3</div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg mb-2">Ask About Strategy</h3>
                                    <p className="text-gray-500 leading-relaxed text-sm">Good agents don&apos;t just find properties; they have a clear strategy to secure them at the best price.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center font-black text-primary shrink-0">4</div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg mb-2">Review Past Results</h3>
                                    <p className="text-gray-500 leading-relaxed text-sm">Look for case studies and testimonials from buyers with similar budgets and goals to yours.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
