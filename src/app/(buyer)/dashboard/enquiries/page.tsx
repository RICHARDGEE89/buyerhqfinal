"use client";

import React from 'react';
import {
    MessageSquare,
    Calendar,
    ArrowLeft
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function MyEnquiriesPage() {
    const enquiries = [
        {
            id: '1',
            agent_name: 'Prestige Property Group',
            subject: 'Looking for off-market in Bondi',
            status: 'pending',
            date: '2024-02-15',
            responses: 0
        },
        {
            id: '2',
            agent_name: 'Melbourne Buyer Experts',
            subject: 'First home buyer advice - Toorak',
            status: 'replied',
            date: '2024-02-10',
            responses: 2
        }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-gray-100 text-gray-600 border-gray-200';
            case 'replied': return 'bg-gray-900 text-white border-gray-900';
            default: return 'bg-gray-50 text-gray-400 border-gray-100';
        }
    };

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-stone font-bold text-xs uppercase tracking-widest mb-1">
                        <Link href="/dashboard" className="hover:text-ocean transition-colors flex items-center gap-1">
                            <ArrowLeft className="w-3 h-3" />
                            Dashboard
                        </Link>
                    </div>
                    <h1 className="text-4xl font-display font-black text-gray-900 tracking-tight">
                        My <span className="text-primary">Enquiries</span>
                    </h1>
                    <p className="text-stone font-medium">Track your communication with property experts.</p>
                </div>
            </div>

            <div className="space-y-6">
                {enquiries.length > 0 ? (
                    enquiries.map((enq) => (
                        <Card key={enq.id} className="border-stone/5 rounded-[2.5rem] bg-white shadow-soft group hover:border-primary/30 transition-all overflow-hidden">
                            <CardContent className="p-0">
                                <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-primary flex-shrink-0">
                                            <MessageSquare className="w-8 h-8" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h4 className="font-bold text-gray-900 text-lg tracking-tight">{enq.agent_name}</h4>
                                                <Badge className={cn("px-3 py-0.5 rounded-lg text-[10px] uppercase font-black tracking-widest border", getStatusColor(enq.status))}>
                                                    {enq.status}
                                                </Badge>
                                            </div>
                                            <p className="text-stone font-medium">{enq.subject}</p>
                                            <div className="flex items-center gap-4 pt-1 text-[10px] font-mono font-bold text-stone/40 uppercase tracking-widest">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3 h-3" />
                                                    {enq.date}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <MessageSquare className="w-3 h-3" />
                                                    {enq.responses} Responses
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <Link href="/agents" className="flex-1 md:flex-none">
                            <Button variant="outline" className="w-full h-12 px-6 rounded-xl border-stone/10 font-bold text-gray-900">
                                View Matching Agents
                            </Button>
                        </Link>
                        <Link href="/contact" className="flex-1 md:flex-none">
                            <Button className="w-full bg-primary hover:bg-primary-700 text-white font-black h-12 px-8 rounded-xl transition-all shadow-lg shadow-gray-900/20">
                                Follow Up
                            </Button>
                        </Link>
                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="py-32 text-center bg-white rounded-[3rem] border border-dashed border-stone/20">
                        <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center text-gray-500 mx-auto mb-6">
                            <MessageSquare className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-display font-black text-gray-900">No enquiries yet</h3>
                        <p className="text-stone font-medium mt-2 max-w-sm mx-auto">
                            Ready to find your dream property? Start by reaching out to our verified agents.
                        </p>
                        <Link href="/agents">
                            <Button className="mt-8 bg-primary text-white font-black h-12 px-8 rounded-xl">
                                Browse Directory
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

// Inline cn to avoid import issues
function cn(...inputs: (string | boolean | undefined)[]) {
    return inputs.filter(Boolean).join(' ');
}
