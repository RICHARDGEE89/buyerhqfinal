"use client";

import React from 'react';
import {
    FileText,
    ExternalLink,
    XCircle,
    AlertCircle,
    BadgeCheck,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function AdminVerificationsPage() {
    const applications = [
        {
            id: '1',
            agency: 'Elite Buyers Agency',
            owner: 'Marcus Aurelius',
            abn: '12 345 678 910',
            licence: 'RE-123456-NSW',
            applied: '2024-02-16',
            status: 'pending',
            docs: ['Licence.pdf', 'ABN_Lookup.pdf', 'Insurance.pdf']
        },
        {
            id: '2',
            agency: 'Harbour City Property',
            owner: 'Julia Roberts',
            abn: '98 765 432 109',
            licence: 'RE-654321-NSW',
            applied: '2024-02-15',
            status: 'in_review',
            docs: ['Licence_Final.pdf', 'Cert_III.png']
        }
    ];

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-display font-black text-midnight tracking-tight">
                        Agency <span className="text-coral">Verifications</span>
                    </h1>
                    <p className="text-stone font-medium">Review and approve new property expert applications.</p>
                </div>
            </div>

            <div className="space-y-8">
                {applications.map((app) => (
                    <Card key={app.id} className="border-stone/5 rounded-[3rem] bg-white shadow-soft overflow-hidden">
                        <CardContent className="p-0">
                            <div className="p-10 grid grid-cols-1 lg:grid-cols-4 gap-12">

                                {/* Agency Info */}
                                <div className="lg:col-span-1 space-y-6">
                                    <div className="w-20 h-20 rounded-3xl bg-midnight flex items-center justify-center text-white font-display font-black text-2xl">
                                        {app.agency.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-display font-black text-midnight tracking-tight">{app.agency}</h3>
                                        <p className="text-stone font-medium text-sm">{app.owner}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className={cn(
                                            "px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                                            app.status === 'pending' ? "bg-amber/10 text-amber border-amber/20" : "bg-ocean/10 text-ocean border-ocean/20"
                                        )}>
                                            {app.status.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Details Table */}
                                <div className="lg:col-span-2 grid grid-cols-2 gap-8 items-center bg-warm/20 rounded-[2rem] p-8 border border-stone/5">
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-mono font-bold text-stone/40 uppercase tracking-widest">ABN Number</div>
                                        <div className="text-sm font-bold text-midnight tracking-tight flex items-center gap-2">
                                            {app.abn}
                                            <ExternalLink className="w-3.5 h-3.5 text-ocean" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-mono font-bold text-stone/40 uppercase tracking-widest">Real Estate Licence</div>
                                        <div className="text-sm font-bold text-midnight tracking-tight">{app.licence}</div>
                                    </div>
                                    <div className="space-y-4 col-span-2 pt-4 border-t border-stone/5">
                                        <div className="text-[10px] font-mono font-bold text-stone/40 uppercase tracking-widest">Submitted Documents</div>
                                        <div className="flex flex-wrap gap-2">
                                            {app.docs.map(doc => (
                                                <div key={doc} className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-stone/10 text-xs font-bold text-midnight hover:border-ocean transition-all cursor-pointer">
                                                    <FileText className="w-3.5 h-3.5 text-stone" />
                                                    {doc}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Verification Actions */}
                                <div className="lg:col-span-1 flex flex-col justify-center gap-4">
                                    <Button className="w-full h-14 bg-verified hover:bg-verified/90 text-white font-black rounded-2xl shadow-xl shadow-verified/20">
                                        <BadgeCheck className="w-5 h-5 mr-2" />
                                        Approve Expert
                                    </Button>
                                    <Button variant="outline" className="w-full h-14 border-coral/20 text-coral font-black rounded-2xl hover:bg-coral/5 transition-all">
                                        <XCircle className="w-5 h-5 mr-2" />
                                        Reject / Flag
                                    </Button>
                                    <div className="pt-4 flex items-center justify-center gap-3 text-stone font-bold text-[10px] uppercase tracking-widest">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        Requires Manual Audit
                                    </div>
                                </div>

                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

