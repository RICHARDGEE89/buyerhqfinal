"use client";

import React from 'react';
import {
    CreditCard,
    CheckCircle2,
    Download,
    Calendar,
    AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AgentBillingPage() {
    const currentPlan = {
        name: 'Verified Partner',
        price: '$149',
        period: 'monthly',
        next_billing: '2024-03-15',
        status: 'active'
    };

    const invoices = [
        { id: 'INV-001', date: '2024-02-15', amount: '$149.00', status: 'paid' },
        { id: 'INV-002', date: '2024-01-15', amount: '$149.00', status: 'paid' },
    ];

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-display font-black text-midnight tracking-tight">
                        Billing & <span className="text-ocean">Subscription</span>
                    </h1>
                    <p className="text-stone font-medium">Manage your agency&apos;s professional membership.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* Current Plan & Management */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="border-stone/5 rounded-[3rem] bg-midnight text-white overflow-hidden shadow-2xl relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-ocean/20 rounded-full blur-[100px] -mr-32 -mt-32" />
                        <CardContent className="p-10 md:p-14 space-y-10 relative z-10">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-4">
                                    <Badge className="bg-ocean text-white border-transparent font-black px-4 py-1.5 rounded-xl uppercase tracking-widest text-[10px]">
                                        Current Plan
                                    </Badge>
                                    <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight">{currentPlan.name}</h2>
                                    <div className="flex items-center gap-2 text-sky/60 font-bold">
                                        <Calendar className="w-4 h-4" />
                                        Next billing date: {currentPlan.next_billing}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-5xl font-mono font-black">{currentPlan.price}</div>
                                    <div className="text-sky/40 text-sm font-bold uppercase tracking-widest mt-1">per month</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-white/5">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-ocean" />
                                    <p className="text-sm font-medium text-sky/80">Unlimited Leads & Enquiries</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-ocean" />
                                    <p className="text-sm font-medium text-sky/80">Verified Badge on Directory</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-ocean" />
                                    <p className="text-sm font-medium text-sky/80">Premium SEO Profile Page</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-ocean" />
                                    <p className="text-sm font-medium text-sky/80">Advanced Analytics Dashboard</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4 pt-10">
                                <Button className="bg-white text-midnight font-black px-10 h-14 rounded-2xl hover:bg-ocean hover:text-white transition-all shadow-xl">
                                    Change Plan
                                </Button>
                                <Button variant="ghost" className="text-white/40 hover:text-coral hover:bg-coral/5 rounded-2xl p-4 h-14">
                                    Cancel Subscription
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Method */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-display font-black text-midnight tracking-tight">Payment Method</h3>
                        <Card className="border-stone/10 rounded-[2.5rem] bg-white p-8 group hover:border-ocean/30 transition-all shadow-soft">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-12 bg-midnight rounded-xl flex items-center justify-center text-white">
                                        <CreditCard className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-midnight tracking-tight italic">Visa ending in 4242</div>
                                        <div className="text-stone text-[10px] font-bold uppercase tracking-widest">Expires 12/26</div>
                                    </div>
                                </div>
                                <Button variant="ghost" className="text-ocean font-bold text-sm hover:underline">
                                    Update
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Invoices */}
                <div className="space-y-6">
                    <h3 className="text-2xl font-display font-black text-midnight tracking-tight">Invoice History</h3>
                    <div className="space-y-3">
                        {invoices.map((inv) => (
                            <Card key={inv.id} className="border-stone/10 rounded-3xl bg-white p-6 hover:shadow-sm transition-all shadow-soft">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-black text-midnight tracking-tight">{inv.amount}</div>
                                        <div className="text-stone text-[10px] font-bold uppercase tracking-widest mt-0.5">{inv.date}</div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl bg-warm/50 text-stone hover:text-ocean transition-all">
                                        <Download className="w-4 h-4" />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <Card className="border-stone/10 rounded-[2rem] bg-warm/20 p-8 space-y-4 shadow-soft">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-ocean" />
                            <h4 className="text-xs font-black text-midnight uppercase tracking-widest">Business Info</h4>
                        </div>
                        <p className="text-xs text-stone font-medium leading-relaxed">
                            Tax invoices are sent to your business email. Ensure your ABN is up to date for GST compliance.
                        </p>
                        <Button variant="outline" className="w-full rounded-xl border-stone/10 text-xs font-bold text-stone hover:text-midnight">
                            Edit Billing Details
                        </Button>
                    </Card>
                </div>

            </div>
        </div>
    );
}
