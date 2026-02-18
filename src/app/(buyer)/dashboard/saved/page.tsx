"use client";

import React from 'react';
import { AgentCard } from '@/components/agents/AgentCard';
import { Button } from '@/components/ui/button';
import { Trash2, ArrowLeft } from 'lucide-react';
import { Agent } from '@/types';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

type SavedAgent = {
    saved_id: string;
} & Partial<Agent>;

export default function SavedAgentsPage() {
    const [savedAgents, setSavedAgents] = React.useState<SavedAgent[]>([]);
    const [loading, setLoading] = React.useState(true);
    const supabase = React.useMemo(() => createClient(), []);
    const router = useRouter();

    React.useEffect(() => {
        const fetchSaved = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const {
                data,
                error,
            } = await supabase
                .from('saved_agents')
                .select(`
                    id,
                    agent:agents (
                        id,
                        business_name,
                        slug,
                        primary_suburb,
                        primary_state,
                        years_experience,
                        licence_verified,
                        specialisations,
                        bio
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error loading saved agents', error);
            }

            if (data) {
                const flattened: SavedAgent[] = data
                    .map((item) =>
                        item.agent
                            ? ({
                                  saved_id: item.id,
                                  ...(item.agent as unknown as Partial<Agent>),
                              } as SavedAgent)
                            : null
                    )
                    .filter((a): a is SavedAgent => a !== null);

                setSavedAgents(flattened);
            }
            setLoading(false);
        };
        fetchSaved();
    }, [router, supabase]);

    const handleRemove = async (savedId: string) => {
        const { error } = await supabase.from('saved_agents').delete().eq('id', savedId);
        if (error) {
            console.error('Error removing saved agent', error);
            return;
        }
        setSavedAgents((prev) => prev.filter((a) => a.saved_id !== savedId));
    };

    if (loading) {
        return <div className="py-20 text-center font-bold text-gray-500">Loading saved agents...</div>;
    }

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">
                        <Link href="/dashboard" className="hover:text-primary transition-colors flex items-center gap-1">
                            <ArrowLeft className="w-3 h-3" />
                            Dashboard
                        </Link>
                    </div>
                    <h1 className="text-4xl font-display font-black text-gray-900 tracking-tight">
                        Saved <span className="text-primary">Agents</span>
                    </h1>
                    <p className="text-gray-500 font-medium">Your shortlist of verified property experts.</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="h-12 px-6 rounded-xl border-gray-200 font-bold text-gray-900 hover:bg-gray-50">
                        Export List
                    </Button>
                    <Button className="bg-primary hover:bg-primary-700 text-white font-black h-12 px-8 rounded-xl shadow-lg">
                        Send Multi-Enquiry
                    </Button>
                </div>
            </div>

            {savedAgents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {savedAgents.map((agent) => (
                        <div key={agent.saved_id} className="relative group">
                            <AgentCard agent={agent} />
                            <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="w-10 h-10 rounded-full shadow-lg"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleRemove(agent.saved_id)
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-24 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center text-gray-400 mx-auto mb-6">
                        <Heart className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-display font-black text-gray-900">No agents saved yet</h3>
                    <p className="text-gray-500 font-medium mt-2 max-w-sm mx-auto">
                        Browse the directory and click the heart icon to start building your professional shortlist.
                    </p>
                    <Link href="/agents">
                        <Button className="mt-8 bg-primary text-white font-black h-12 px-8 rounded-xl">
                            Browse Directory
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
}

// Minimal Heart icon replacement for the empty state
function Heart(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
    );
}
