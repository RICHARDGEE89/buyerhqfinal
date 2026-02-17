import React from 'react';
import { MapPin, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const locations = [
    { name: 'Sydney', state: 'NSW', count: 0 },
    { name: 'Melbourne', state: 'VIC', count: 0 },
    { name: 'Brisbane', state: 'QLD', count: 0 },
    { name: 'Perth', state: 'WA', count: 0 },
    { name: 'Adelaide', state: 'SA', count: 0 },
    { name: 'Gold Coast', state: 'QLD', count: 0 },
    { name: 'Canberra', state: 'ACT', count: 0 },
    { name: 'Sunshine Coast', state: 'QLD', count: 0 },
    { name: 'Hobart', state: 'TAS', count: 0 },
    { name: 'Darwin', state: 'NT', count: 0 },
];

export const LocationGrid = () => {
    return (
        <section className="py-24 bg-midnight relative overflow-hidden">
            {/* Decorative background circle */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal/5 rounded-full blur-[100px] -mr-64 -mt-64" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-display font-black text-white tracking-tight">
                        Find Agents Across Australia
                    </h2>
                    <p className="text-stone font-medium text-lg leading-relaxed">
                        Connect with local experts who know your target market inside out.
                    </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                    {locations.map((loc) => (
                        <Link
                            key={loc.name}
                            href={`/agents?state=${loc.state}&suburb=${loc.name}`}
                            className="group p-8 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white hover:border-white transition-all duration-500"
                        >
                            <div className="flex flex-col h-full">
                                <div className="w-10 h-10 rounded-xl bg-white/10 group-hover:bg-teal flex items-center justify-center text-white transition-colors mb-4">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-display font-black text-white group-hover:text-midnight transition-colors">
                                    {loc.name}
                                </h3>
                                <p className="text-stone group-hover:text-teal transition-colors text-xs font-bold uppercase tracking-widest mt-1">
                                    {loc.state}
                                </p>

                                <div className="mt-6 pt-6 border-t border-white/10 group-hover:border-stone/10 flex items-center justify-between">
                                    <span className="text-[10px] font-mono font-bold text-white/40 group-hover:text-stone uppercase tracking-widest">
                                        {loc.count} Experts
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-teal transition-all transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};
