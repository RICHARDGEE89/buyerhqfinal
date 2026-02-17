import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export const MatchCTA = () => {
    return (
        <section className="py-32 bg-gray-50 relative overflow-hidden">
            {/* Animated background pulse */}
            <div className="absolute inset-0 bg-white/50 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />

            <div className="container mx-auto px-6 text-center relative z-10 space-y-10">
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-gray-900 text-sm font-bold uppercase tracking-widest border border-gray-200 shadow-sm">
                        <Sparkles className="w-4 h-4 text-primary fill-transparent" />
                        Personalized Matching
                    </div>
                    <h2 className="text-4xl md:text-7xl font-display font-black text-gray-900 leading-tight tracking-tight">
                        Not Sure Where <br className="hidden md:block" /> to Start?
                    </h2>
                    <p className="text-xl md:text-2xl text-gray-600 font-medium leading-relaxed">
                        Stop guessing and start matching. Australia&apos;s most reliable way to find verified property representation.
                        Takes 2 minutes.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <Link href="/get-matched">
                        <Button size="lg" className="h-20 px-16 bg-primary text-white hover:bg-primary-700 transition-all text-2xl font-black rounded-[2rem] shadow-2xl transform hover:scale-105 active:scale-95 border-0">
                            Get Matched Now
                        </Button>
                    </Link>
                    <div className="text-left">
                        <p className="text-gray-900 font-bold text-sm">Free service for buyers</p>
                        <p className="text-gray-500 text-xs font-mono uppercase tracking-widest mt-1">No sign-up required</p>
                    </div>
                </div>
            </div>
        </section>
    );
};
