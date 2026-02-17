import React from 'react';
import { Metadata } from 'next';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
    title: "Blog | Property Market Insights & Tips | BuyerHQ",
    description: "Expert advice on buying property in Australia. From auction bidding tips to market trends and buyer's agency insights.",
};

export default function BlogPage() {
    const posts = [
        {
            title: "5 Questions to Ask Your Buyer's Agent",
            excerpt: "Not all advocates are created equal. Here are the critical questions to ask before signing an agreement.",
            date: "Feb 12, 2024",
            readTime: "5 min read",
            category: "Buyer Tips"
        },
        {
            title: "Is 2024 the Year for Investment?",
            excerpt: "Market trends are shifting. We analyze the growth suburbs for the coming year.",
            date: "Jan 28, 2024",
            readTime: "8 min read",
            category: "Market Insights"
        },
        {
            title: "The Silent Seller: How Off-Market Works",
            excerpt: "Why nearly 30% of premium properties never hit the open portals.",
            date: "Jan 15, 2024",
            readTime: "6 min read",
            category: "Strategy"
        }
    ];

    return (
        <div className="bg-white min-h-screen pt-40 pb-24">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="text-center space-y-4 mb-20 max-w-3xl mx-auto">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-teal/5 text-teal text-xs font-bold uppercase tracking-widest border border-teal/10">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Insights &amp; Strategy
                    </div>
                    <h1 className="text-5xl md:text-7xl font-display font-black text-midnight tracking-tight">
                        Buyer <span className="text-teal">Intelligence.</span>
                    </h1>
                    <p className="text-xl text-stone font-medium leading-relaxed italic">
                        &quot;Expert advice to help you navigate the property maze.&quot;
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {posts.map((post, i) => (
                        <Card key={i} className="border-stone/10 rounded-[2.5rem] bg-white hover:shadow-soft transition-all duration-500 overflow-hidden group">
                            <CardContent className="p-0">
                                <div className="aspect-[16/10] bg-warm flex items-center justify-center text-midnight font-display font-black text-2xl group-hover:scale-105 transition-transform duration-700">
                                    BHQ / BLOG
                                </div>
                                <div className="p-10 space-y-6">
                                    <div className="flex items-center gap-4 text-[10px] font-mono font-bold text-stone uppercase tracking-widest">
                                        <span className="text-teal border-b-2 border-teal pb-1">{post.category}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                                    </div>
                                    <h3 className="text-2xl font-display font-black text-midnight tracking-tight leading-tight group-hover:text-teal transition-colors">
                                        {post.title}
                                    </h3>
                                    <p className="text-stone font-medium leading-relaxed line-clamp-2 italic">
                                        &quot;{post.excerpt}&quot;
                                    </p>
                                    <Button variant="ghost" className="p-0 text-midnight font-black flex items-center gap-2 hover:bg-transparent hover:text-teal group/btn">
                                        Read Article <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
