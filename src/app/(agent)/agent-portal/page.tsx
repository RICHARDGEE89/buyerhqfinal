"use client";

import React from 'react';
import {
    Users,
    Eye,
    MousePointer2,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    Sparkles,
    ChevronRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AgentDashboardOverview() {
    const metrics = [
        { label: 'Total Leads', value: '124', icon: Users, trend: '+12%', trendUp: true, color: 'text-primary bg-primary/10' },
        { label: 'Profile Views', value: '1.2k', icon: Eye, trend: '+5%', trendUp: true, color: 'text-gray-900 bg-gray-900/10' },
        { label: 'Click Rate', value: '4.8%', icon: MousePointer2, trend: '-2%', trendUp: false, color: 'text-verified bg-verified/10' },
        { label: 'Match Rate', value: '72%', icon: Sparkles, trend: '+8%', trendUp: true, color: 'text-primary bg-primary/10' },
    ];

    const recentLeads = [
        { id: '1', name: 'James Wilson', type: 'First Home Buyer', location: 'Bondi, NSW', date: '2 hours ago', status: 'new' },
        { id: '2', name: 'Sarah Jenkins', type: 'Investment', location: 'Surry Hills, NSW', date: '5 hours ago', status: 'read' },
        { id: '3', name: 'Robert Chen', type: 'Luxury Home', location: 'Vaucluse, NSW', date: '1 day ago', status: 'replied' },
    ];

    return (
        <div className="space-y-12">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-display font-black text-gray-900 tracking-tight">
                        Dashboard <span className="text-primary">Overview</span>
                    </h1>
                    <p className="text-stone font-medium">Performance summary for Prestige Property Group.</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="h-12 px-6 rounded-xl border-stone/10 font-bold text-gray-900 bg-white">
                        Export Report
                    </Button>
                    <Button className="bg-gray-900 hover:bg-primary text-white font-black h-12 px-8 rounded-xl transition-all shadow-lg">
                        Manage Profile
                    </Button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((m) => (
                    <Card key={m.label} className="border-stone/5 rounded-[2.5rem] bg-white shadow-soft group hover:border-primary/30 transition-all">
                        <CardContent className="p-8 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", m.color)}>
                                    <m.icon className="w-6 h-6" />
                                </div>
                                <div className={cn(
                                    "flex items-center gap-1 text-[10px] font-black uppercase tracking-widest",
                                    m.trendUp ? "text-verified underline decoration-verified/20" : "text-primary underline decoration-amber/20"
                                )}>
                                    {m.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {m.trend}
                                </div>
                            </div>
                            <div>
                                <div className="text-3xl font-mono font-black text-gray-900">{m.value}</div>
                                <div className="text-xs font-bold text-stone uppercase tracking-widest mt-1">{m.label}</div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* Recent Leads */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-display font-black text-gray-900 tracking-tight">Recent Leads</h2>
                        <Link href="/agent-portal/leads" className="text-primary font-bold text-sm hover:underline flex items-center gap-2">
                            View all leads <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {recentLeads.map((lead) => (
                            <Card key={lead.id} className="border-stone/5 rounded-[2.5rem] bg-white shadow-sm overflow-hidden group hover:border-primary/20 transition-all">
                                <CardContent className="p-8 flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-warm flex items-center justify-center font-display font-black text-primary">
                                            {lead.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h4 className="font-bold text-gray-900 text-lg">{lead.name}</h4>
                                                <div className={cn(
                                                    "px-3 py-0.5 rounded-lg text-[10px] uppercase font-black tracking-widest border",
                                                    lead.status === 'new' ? "bg-primary/10 text-primary border-primary/20" : "bg-stone/5 text-stone border-stone/10"
                                                )}>
                                                    {lead.status}
                                                </div>
                                            </div>
                                            <p className="text-sm text-stone font-medium">{lead.type} • {lead.location}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right hidden md:block">
                                            <div className="text-[10px] font-mono font-bold text-stone/40 uppercase tracking-widest">Received</div>
                                            <div className="text-sm font-bold text-gray-900">{lead.date}</div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="bg-warm/50 hover:bg-primary hover:text-white transition-all rounded-xl w-12 h-12">
                                            <ChevronRight className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Action Center / Tips */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-display font-black text-gray-900 tracking-tight">Action Center</h2>
                    <div className="space-y-4">
                        <Card key="optimise-profile" className="border-stone/5 rounded-[2.5rem] bg-gray-900 text-white p-8 space-y-6 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
                            <div className="space-y-2 relative z-10">
                                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mb-4">
                                    <TrendingUp className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-display font-black tracking-tight leading-tight">Optimise your Profile</h3>
                                <p className="text-white/40 text-sm font-medium">Adding a video introduction can increase lead conversion by 45%.</p>
                            </div>
                            <Button className="w-full bg-white text-gray-900 font-black rounded-xl h-12 hover:bg-primary hover:text-white transition-all">
                                Add Video Now
                            </Button>
                        </Card>

                        <Card className="border-stone/10 rounded-[2.5rem] bg-warm/30 p-8 space-y-4">
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-stone" />
                                <h4 className="text-xs font-black text-stone uppercase tracking-widest">Average Response Time</h4>
                            </div>
                            <div className="text-2xl font-mono font-black text-gray-900">14 Mins</div>
                            <div className="h-1.5 bg-stone/10 rounded-full overflow-hidden">
                                <div className="h-full bg-verified w-[85%] rounded-full shadow-sm" />
                            </div>
                            <p className="text-[10px] font-bold text-verified uppercase tracking-widest">Exceeding platform average</p>
                        </Card>
                    </div>
                </div>

            </div>
        </div>
    );
}

// Inline cn
function cn(...inputs: (string | boolean | undefined)[]) {
    return inputs.filter(Boolean).join(' ');
}
