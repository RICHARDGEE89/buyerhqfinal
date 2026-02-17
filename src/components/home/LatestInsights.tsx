import React from 'react';
import { ArrowRight, TrendingUp, Home, Shield } from 'lucide-react';
import Link from 'next/link';

const insights = [
    {
        category: "Market Trends",
        title: "Why 2026 is the Year of the Buyer's Agent",
        excerpt: "As property markets become more complex, the value of professional representation has never been higher.",
        icon: TrendingUp,
        date: "Feb 12, 2026",
    },
    {
        category: "Buying Strategy",
        title: "5 Signs You're Overpaying for a Property",
        excerpt: "Learn the red flags that selling agents don't want you to spot during your next inspection.",
        icon: Home,
        date: "Feb 08, 2026",
    },
    {
        category: "Case Study",
        title: "Securing a Dream Home Under Budget in Bondi",
        excerpt: "How one of our verified advocates saved a client $150k through strategic negotiation.",
        icon: Shield,
        date: "Jan 29, 2026",
    },
];

export const LatestInsights = () => {
    return (
        <section className="py-24 bg-white border-t border-stone/5">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="space-y-4 max-w-2xl">
                        <h2 className="text-4xl md:text-5xl font-display font-black text-gray-900 tracking-tight">
                            Latest <span className="text-primary">Insights.</span>
                        </h2>
                        <p className="text-lg text-stone font-medium leading-relaxed">
                            Expert advice, market analysis, and success stories from Australia&apos;s leading buyer&apos;s advocates.
                        </p>
                    </div>
                    <Link href="/blog" className="hidden md:flex items-center text-gray-900 font-bold hover:text-primary transition-colors group">
                        View all articles
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {insights.map((item, i) => (
                        <div key={i} className="group cursor-pointer">
                            <div className="aspect-[4/3] bg-warm rounded-[2.5rem] mb-6 relative overflow-hidden">
                                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                                <div className="absolute top-6 left-6 bg-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-primary shadow-sm">
                                    {item.category}
                                </div>
                                <div className="absolute bottom-6 right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-900 group-hover:scale-110 transition-transform shadow-sm">
                                    <item.icon className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="text-xs font-bold text-stone/60 uppercase tracking-widest">{item.date}</div>
                                <h3 className="text-2xl font-display font-black text-gray-900 leading-tight group-hover:text-primary transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-stone font-medium leading-relaxed">
                                    {item.excerpt}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <Link href="/blog" className="md:hidden mt-12 flex items-center justify-center text-gray-900 font-bold hover:text-primary transition-colors group">
                    View all articles
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </section>
    );
};
