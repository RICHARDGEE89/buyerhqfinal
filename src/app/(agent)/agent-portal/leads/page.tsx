"use client";

import React, { useState } from 'react';
import {
    MessageSquare,
    Search,
    ChevronRight,
    Calendar,
    MapPin,
    BadgeCheck
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Lead {
    id: string;
    name: string;
    type: string;
    location: string;
    budget: string;
    date: string;
    status: string;
    email: string;
}

export default function AgentLeadsPage() {
    const [filter, setFilter] = useState('all');

    const leads: Lead[] = [
        { id: '1', name: 'James Wilson', type: 'First Home Buyer', location: 'Bondi, NSW', budget: '$1.2M - $1.5M', date: '2024-02-15', status: 'new', email: 'j.wilson@demo.com' },
        { id: '2', name: 'Sarah Jenkins', type: 'Investment', location: 'Surry Hills, NSW', budget: '$2M+', date: '2024-02-14', status: 'replied', email: 's.jenkins@test.com' },
        { id: '3', name: 'Robert Chen', type: 'Luxury Home', location: 'Vaucluse, NSW', budget: '$5M+', date: '2024-02-12', status: 'read', email: 'r.chen@demo.com' },
        { id: '4', name: 'Emily Davis', type: 'Family Home', location: 'Paddington, NSW', budget: '$3M - $4M', date: '2024-02-10', status: 'archived', email: 'e.davis@example.com' },
    ];

    const filteredLeads = filter === 'all' ? leads : leads.filter(l => l.status === filter);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new': return 'bg-primary/10 text-primary border-primary/20';
            case 'replied': return 'bg-verified/10 text-verified border-verified/20';
            case 'read': return 'bg-primary/10 text-primary border-primary/20';
            default: return 'bg-stone/10 text-stone border-stone/10';
        }
    };

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-display font-black text-gray-900 tracking-tight">
                        Leads & <span className="text-primary">Enquiries</span>
                    </h1>
                    <p className="text-stone font-medium">Manage and respond to property buyer interest.</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="h-12 px-6 rounded-xl border-stone/10 font-bold text-gray-900 bg-white">
                        Download CSV
                    </Button>
                    <Button className="bg-primary text-white font-black h-12 px-8 rounded-xl shadow-lg shadow-teal/20">
                        Bulk Action
                    </Button>
                </div>
            </div>

            <div className="space-y-8">
                {/* Filters & Search */}
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-2 bg-warm/30 p-1.5 rounded-2xl border border-stone/5 w-full lg:w-auto">
                        {['all', 'new', 'replied', 'archived'].map((f) => (
                            <Button
                                key={f}
                                variant="ghost"
                                size="sm"
                                onClick={() => setFilter(f)}
                                className={cn(
                                    "rounded-xl h-10 px-6 font-bold capitalize transition-all",
                                    filter === f ? "bg-white shadow-sm text-gray-900" : "text-stone hover:text-gray-900"
                                )}
                            >
                                {f}
                            </Button>
                        ))}
                    </div>
                    <div className="relative w-full lg:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone" />
                        <Input placeholder="Search by name, location..." className="h-12 pl-12 rounded-xl border-stone/10 bg-white" />
                    </div>
                </div>

                {/* Leads Grid/Table */}
                <div className="space-y-4">
                    {filteredLeads.map((lead) => (
                        <Card key={lead.id} className="border-stone/5 rounded-[2.5rem] bg-white shadow-soft group hover:border-primary/20 transition-all overflow-hidden">
                            <CardContent className="p-0">
                                <div className="p-8 flex flex-col lg:flex-row lg:items-center gap-8">
                                    {/* Buyer Identity */}
                                    <div className="flex items-center gap-6 min-w-[300px]">
                                        <div className="w-16 h-16 rounded-2xl bg-gray-900 flex items-center justify-center text-white font-display font-black text-xl">
                                            {lead.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-gray-900 text-lg tracking-tight">{lead.name}</h4>
                                                <Badge className={cn("px-2.5 py-0.5 rounded-lg text-[10px] uppercase font-black tracking-widest border", getStatusColor(lead.status))}>
                                                    {lead.status}
                                                </Badge>
                                            </div>
                                            <p className="text-stone font-medium text-sm">{lead.email}</p>
                                        </div>
                                    </div>

                                    {/* Criteria Stats */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 flex-1">
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-mono font-bold text-stone/40 uppercase tracking-widest">Property Goal</div>
                                            <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                                                <MapPin className="w-3.5 h-3.5 text-primary" />
                                                {lead.location}
                                            </div>
                                            <div className="text-xs text-stone font-medium">{lead.type}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-mono font-bold text-stone/40 uppercase tracking-widest">Budget</div>
                                            <div className="text-sm font-bold text-gray-900 tracking-tight">{lead.budget}</div>
                                            <div className="text-xs text-verified font-bold uppercase tracking-widest flex items-center gap-1">
                                                <BadgeCheck className="w-3 h-3" />
                                                Funds Verified
                                            </div>
                                        </div>
                                        <div className="space-y-1 hidden md:block">
                                            <div className="text-[10px] font-mono font-bold text-stone/40 uppercase tracking-widest">Received</div>
                                            <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                                                <Calendar className="w-3.5 h-3.5 text-stone" />
                                                {lead.date}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-4">
                                        <Button variant="outline" className="h-14 px-8 rounded-xl border-stone/10 font-black text-gray-900 flex-1 lg:flex-none">
                                            <MessageSquare className="w-4 h-4 mr-2" />
                                            Quick Reply
                                        </Button>
                                        <Button className="h-14 w-14 rounded-xl bg-warm/50 text-gray-900 hover:bg-primary hover:text-white transition-all flex items-center justify-center flex-shrink-0">
                                            <ChevronRight className="w-6 h-6" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty State Mock */}
                {filteredLeads.length === 0 && (
                    <div className="py-32 text-center bg-white rounded-[3rem] border border-dashed border-stone/20">
                        <h3 className="text-2xl font-display font-black text-gray-900">No leads found</h3>
                        <p className="text-stone font-medium mt-2">Try adjusting your filters to see more results.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Inline cn
function cn(...inputs: (string | boolean | undefined)[]) {
    return inputs.filter(Boolean).join(' ');
}
