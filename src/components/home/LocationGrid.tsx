import React from 'react';
import { MapPin, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const locations = [
    { name: 'New South Wales', state: 'NSW', count: 0 },
    { name: 'Victoria', state: 'VIC', count: 0 },
    { name: 'Queensland', state: 'QLD', count: 0 },
    { name: 'Western Australia', state: 'WA', count: 0 },
    { name: 'South Australia', state: 'SA', count: 0 },
    { name: 'Tasmania', state: 'TAS', count: 0 },
    { name: 'Australian Capital Territory', state: 'ACT', count: 0 },
    { name: 'Northern Territory', state: 'NT', count: 0 },
];

export const LocationGrid = () => {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            {/* Decorative background circle */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gray-100 rounded-full blur-[100px] -mr-64 -mt-64" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-display font-black text-gray-900 tracking-tight">
                        Find Agents Across Australia
                    </h2>
                    <p className="text-gray-600 font-medium text-lg leading-relaxed">
                        Connect with local experts who know your target market inside out.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {locations.map((loc) => (
                        <Link
                            key={loc.name}
                            href={`/agents?state=${loc.state}`}
                            className="group p-8 bg-gray-50 border border-gray-200 rounded-[2rem] hover:bg-white hover:border-primary hover:shadow-lg transition-all duration-500 min-h-[160px] flex flex-col justify-between"
                        >
                            <div className="flex flex-col h-full">
                                <div className="w-10 h-10 rounded-xl bg-white group-hover:bg-primary flex items-center justify-center text-gray-900 group-hover:text-white transition-colors mb-4 border border-gray-100">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-display font-black text-gray-900 transition-colors">
                                    {loc.name}
                                </h3>
                                <p className="text-gray-500 group-hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest mt-1">
                                    {loc.state}
                                </p>

                                <div className="mt-6 pt-6 border-t border-gray-200 group-hover:border-gray-100 flex items-center justify-between">
                                    <span className="text-[10px] font-mono font-bold text-gray-400 group-hover:text-gray-600 uppercase tracking-widest">
                                        {loc.count} Experts
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-all transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};
