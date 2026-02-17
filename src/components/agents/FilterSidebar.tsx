"use client";

import React from 'react';
import { Star, ShieldCheck } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const specializations = [
    'First Home Buyers',
    'Luxury Homes',
    'Investment Strategy',
    'Off-Market Deals',
    'Auction Bidding',
    'Commercial Property',
    'Interstate Relocation'
];

const states = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

export const FilterSidebar = () => {
    return (
        <aside className="space-y-8 w-full">
            {/* Search Header for Mobile only */}
            <div className="flex items-center justify-between lg:hidden mb-6">
                <h3 className="font-display font-black text-gray-900 text-xl">Refine Search</h3>
                <Button variant="ghost" size="sm" className="text-primary font-bold">Reset</Button>
            </div>

            <Card className="border-stone/10 rounded-[2rem] overflow-hidden sticky top-24">
                <CardContent className="p-8 space-y-10">

                    {/* Trust Filters */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-mono font-bold text-stone uppercase tracking-[0.2em]">Trust Settings</h4>
                        <div className="space-y-3">
                            <label className="flex items-center justify-between p-3 rounded-xl bg-verified/5 border border-verified/10 cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="w-5 h-5 text-verified" />
                                    <span className="text-sm font-bold text-gray-900 group-hover:text-verified transition-colors">Verified Only</span>
                                </div>
                                <Checkbox defaultChecked />
                            </label>
                            <label className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10 cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <Star className="w-5 h-5 text-primary fill-lime" />
                                    <span className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">Top Rated (4.5+)</span>
                                </div>
                                <Checkbox />
                            </label>
                        </div>
                    </div>

                    {/* Specializations */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-mono font-bold text-stone uppercase tracking-[0.2em]">Specialization</h4>
                        <div className="space-y-3">
                            {specializations.map((spec) => (
                                <label key={spec} className="flex items-center gap-3 cursor-pointer group">
                                    <Checkbox id={spec} />
                                    <span className="text-sm font-medium text-stone group-hover:text-gray-900 transition-colors">{spec}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* States */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-mono font-bold text-stone uppercase tracking-[0.2em]">Region / State</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {states.map((state) => (
                                <label key={state} className="flex items-center gap-3 p-3 border border-stone/10 rounded-xl hover:border-primary hover:bg-primary/5 cursor-pointer transition-all">
                                    <Checkbox id={state} />
                                    <span className="text-xs font-bold text-gray-900">{state}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <Button className="w-full bg-gray-900 text-white font-black h-12 rounded-xl">
                        Apply Refinements
                    </Button>

                    <Button variant="ghost" className="w-full text-stone hover:text-gray-900 font-bold">
                        Clear All Filters
                    </Button>

                </CardContent>
            </Card>
        </aside>
    );
};
