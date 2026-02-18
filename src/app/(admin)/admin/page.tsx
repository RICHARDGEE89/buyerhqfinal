"use client";

import React from 'react';
import {
    MessageSquare,
    TrendingUp,
    ShieldAlert,
    FileText,
    CheckCircle2,
    Clock,
    ArrowRight,
    UserPlus
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function AdminDashboardOverview() {
    const metrics = [
        { label: 'Total Enquiries', value: '0', icon: MessageSquare, color: 'text-primary bg-primary/10' },
        { label: 'Verified Agents', value: '0', icon: CheckCircle2, color: 'text-verified bg-verified/10' },
        { label: 'Pending Apps', value: '0', icon: ShieldAlert, color: 'text-primary bg-primary/10' },
        { label: 'Platform Revenue', value: '$0', icon: TrendingUp, color: 'text-gray-900 bg-gray-900/10' },
    ];

    const pendingVerifications = [
        { id: '1', agency: 'Elite Buyers Agency', name: 'Marcus Aurelius', date: '6 hours ago', type: 'Platinum' },
        { id: '2', agency: 'Harbour City Property', name: 'Julia Roberts', date: '1 day ago', type: 'Standard' },
        { id: '3', agency: 'QLD Experts', name: 'Steve Smith', date: '2 days ago', type: 'Verified' },
    ];

    return (
        <div className="space-y-12">
            {/* Platform Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-display font-black text-gray-900 tracking-tight">
                        System <span className="text-primary">Overview</span>
                    </h1>
                    <p className="text-stone font-medium">Global platform health and operational status.</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="h-12 px-6 rounded-xl border-stone/10 font-bold text-gray-900 bg-white">
                        System Health
                    </Button>
                    <Link href="/admin/bulk-upload">
                        <Button className="bg-primary text-white font-black h-12 px-8 rounded-xl shadow-lg shadow-teal/20">
                            Bulk Upload
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Admin Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((m) => (
                    <Card key={m.label} className="border-stone/5 rounded-[2.5rem] bg-white shadow-soft transition-all hover:border-primary/20">
                        <CardContent className="p-8 space-y-4">
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", m.color)}>
                                <m.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-3xl font-mono font-black text-gray-900">{m.value}</div>
                                <div className="text-[10px] font-bold text-stone uppercase tracking-widest mt-1">{m.label}</div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* Verification Queue */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-display font-black text-gray-900 tracking-tight">Verification Queue</h2>
                        <Link href="/admin/verifications" className="text-primary font-bold text-sm hover:underline flex items-center gap-2">
                            View all applications <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {pendingVerifications.map((app) => (
                            <Card key={app.id} className="border-stone/5 rounded-[2.5rem] bg-white shadow-sm overflow-hidden group hover:border-primary/20 transition-all">
                                <CardContent className="p-8 flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-2xl bg-warm flex items-center justify-center text-gray-900 font-display font-black">
                                            {app.agency.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h4 className="font-bold text-gray-900 text-lg">{app.agency}</h4>
                                                <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-0.5 rounded-lg text-[10px] uppercase font-black tracking-widest">
                                                    {app.type}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-stone font-medium">{app.name} • Applied {app.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Button variant="ghost" className="h-12 w-12 rounded-2xl bg-warm/50 hover:bg-verified hover:text-white transition-all">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </Button>
                                        <Button className="h-12 px-6 bg-gray-900 text-white font-black rounded-xl text-sm">
                                            Review Docs
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Global Activity Feed / Quick Actions */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-display font-black text-gray-900 tracking-tight">Quick Actions</h2>
                    <div className="space-y-4">
                        <Card className="border-stone/10 rounded-[2.5rem] bg-white p-8 space-y-6 shadow-soft">
                            <div className="space-y-4">
                                <Link href="/join">
                                    <Button className="w-full justify-start h-14 bg-warm/30 hover:bg-primary hover:text-white text-gray-900 font-bold rounded-xl transition-all">
                                        <UserPlus className="w-5 h-5 mr-4" />
                                        Invite New Agency
                                    </Button>
                                </Link>
                                <Link href="/admin/verifications">
                                    <Button className="w-full justify-start h-14 bg-warm/30 hover:bg-primary hover:text-white text-gray-900 font-bold rounded-xl transition-all">
                                        <FileText className="w-5 h-5 mr-4" />
                                        Generate Verification Report
                                    </Button>
                                </Link>
                                <Link href="/admin/verifications">
                                    <Button className="w-full justify-start h-14 bg-warm/30 hover:bg-primary hover:text-white text-gray-900 font-bold rounded-xl transition-all">
                                        <ShieldAlert className="w-5 h-5 mr-4" />
                                        Review Flagged Content
                                    </Button>
                                </Link>
                            </div>
                        </Card>

                        <Card className="border-stone/10 rounded-[2.5rem] bg-gray-900 text-white p-8 space-y-4 shadow-xl">
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-primary" />
                                <h4 className="text-xs font-black text-primary uppercase tracking-widest">System Health</h4>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-xs font-bold">
                                    <span className="text-white/40">DB Connection</span>
                                    <span className="text-verified">Stable</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-bold">
                                    <span className="text-white/40">API Response</span>
                                    <span className="text-verified">42ms</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-bold">
                                    <span className="text-white/40">Auth Service</span>
                                    <span className="text-verified">Online</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

            </div>
        </div>
    );
}

