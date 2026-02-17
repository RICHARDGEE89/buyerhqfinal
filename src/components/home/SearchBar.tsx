"use client";

import React, { useState } from 'react';
import { Search, MapPin, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export const SearchBar = ({ className }: { className?: string }) => {
    const [query, setQuery] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/agents?q=${encodeURIComponent(query)}`);
        } else {
            router.push('/agents');
        }
    };

    return (
        <div className={cn("relative w-full max-w-3xl mx-auto group", className)}>
            {/* Animated Glow Backdrop */}
            <div className="absolute -inset-1 bg-gradient-to-r from-teal to-midnight rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" />

            <form
                onSubmit={handleSearch}
                className="relative flex flex-col sm:flex-row items-stretch gap-2 p-2 bg-white rounded-[2rem] shadow-soft border border-stone/10"
            >
                <div className="flex-1 flex items-center px-4 gap-3 border-b sm:border-b-0 sm:border-r border-stone/5 py-3 sm:py-0">
                    <MapPin className="w-5 h-5 text-lime" />
                    <input
                        type="text"
                        placeholder="Suburb, state, or postcode..."
                        className="w-full bg-transparent border-none focus:outline-none text-midnight font-medium placeholder:text-stone/50 text-lg"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        className="hidden lg:flex items-center gap-2 text-stone hover:text-lime transition-colors font-bold px-4"
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        <span>Filters</span>
                    </Button>

                    <Button
                        type="submit"
                        className="h-14 px-8 bg-lime hover:bg-lime/90 text-white text-lg font-bold rounded-2xl shadow-lg shadow-teal/20 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <span>Find Agents</span>
                        <Search className="w-5 h-5" />
                    </Button>
                </div>
            </form>

            {/* Trust Badges below search */}
            <div className="flex flex-wrap justify-center gap-6 mt-8 animate-in fade-in slide-in-from-top-2 duration-700 delay-300">
                <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
                    <span className="w-1.5 h-1.5 bg-verified rounded-full" />
                    Free for buyers
                </div>
                <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
                    <span className="w-1.5 h-1.5 bg-verified rounded-full" />
                    Licence verified
                </div>
                <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
                    <span className="w-1.5 h-1.5 bg-verified rounded-full" />
                    No obligation
                </div>
            </div>
        </div>
    );
};
