"use client";

import React from 'react';
import {
    Heart,
    MessageSquare,
    ArrowRight,
    CheckCircle2,
    Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function BuyerDashboardOverview() {
    const stats = [
        { label: 'Saved Agents', value: 4, icon: Heart, color: 'text-lime bg-lime/10' },
        { label: 'Active Enquiries', value: 1, icon: MessageSquare, color: 'text-lime bg-lime/10' },
        { label: 'Match Quiz Result', value: 'Ready', icon: Heart, color: 'text-lime bg-lime/10' },
    ];

    return (
        <div className="space-y-12">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-display font-black text-midnight tracking-tight">
                        Hi, <span className="text-lime">Richard</span>
                    </h1>
                    <p className="text-stone font-medium">Here&apos;s what&apos;s happening with your property search.</p>
                </div>
                <Link href="/get-matched">
                    <Button className="bg-lime hover:bg-lime/90 text-white font-black h-12 px-8 rounded-xl shadow-lg shadow-teal/20">
                        Find New Matches
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.label} className="border-stone/5 rounded-[2rem] bg-white shadow-soft transition-transform hover:-translate-y-1">
                        <CardContent className="p-8 flex items-center gap-6">
                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", stat.color)}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-mono font-black text-midnight">{stat.value}</div>
                                <div className="text-xs font-bold text-stone uppercase tracking-widest mt-1">{stat.label}</div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* Recent Activity / Recommendations */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-display font-black text-midnight tracking-tight">Recommended for You</h2>
                    <div className="space-y-4">
                        {[1, 2].map((i) => (
                            <Card key={i} className="border-stone/5 rounded-[2rem] bg-white shadow-sm overflow-hidden group">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-warm flex items-center justify-center font-display font-black text-lime">
                                            BHQ
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-midnight">Sydney Property Group</h4>
                                            <p className="text-xs text-stone font-medium">Matches your &apos;Bondi&apos; search criteria</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-stone group-hover:text-lime transition-colors">
                                        <ArrowRight className="w-5 h-5" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <Link href="/agents" className="inline-flex items-center text-lime font-bold text-sm hover:underline">
                        Browse all agents <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                </div>

                {/* Next Steps / Checklist */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-display font-black text-midnight tracking-tight">Your Action Plan</h2>
                    <div className="p-8 rounded-[2.5rem] bg-midnight text-white space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="mt-1 flex-shrink-0 w-6 h-6 bg-verified rounded-full flex items-center justify-center border-2 border-white/20">
                                <CheckCircle2 className="w-3 h-3 text-white" />
                            </div>
                            <div>
                                <div className="font-bold text-sm">Perfect your Match Quiz profile</div>
                                <p className="text-xs text-white/40 mt-1">Complete your preferences to get 5/5 matched agents.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 opacity-50">
                            <div className="mt-1 flex-shrink-0 w-6 h-6 bg-white/10 rounded-full flex items-center justify-center border-2 border-white/20">
                                <Clock className="w-3 h-3 text-white" />
                            </div>
                            <div>
                                <div className="font-bold text-sm">Send your first enquiry</div>
                                <p className="text-xs text-white/40 mt-1">Connect with an agent to discuss your budget.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 opacity-50">
                            <div className="mt-1 flex-shrink-0 w-6 h-6 bg-white/10 rounded-full flex items-center justify-center border-2 border-white/20">
                                <Clock className="w-3 h-3 text-white" />
                            </div>
                            <div>
                                <div className="font-bold text-sm">Verify your buyer status</div>
                                <p className="text-xs text-white/40 mt-1">Upload proof of funds to get responses faster.</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

// Inline cn to avoid import issues
function cn(...inputs: string[]) {
    return inputs.filter(Boolean).join(' ');
}
