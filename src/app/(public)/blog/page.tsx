import React from 'react';
import { Metadata } from 'next';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
    title: "Blog | Property Market Insights & Tips | BuyerHQ",
    description: "Expert advice on buying property in Australia. From auction bidding tips to market trends and buyer's agency insights.",
};

export default function BlogPage() {
    const posts = [
        {
            title: "Why 2026 is the Year of the Buyer's Agent",
            excerpt: "As property markets become more complex and competitive, the value of professional representation has never been higher for Australian families.",
            date: "Feb 12, 2026",
            readTime: "5 min read",
            category: "Market Trends"
        },
        {
            title: "5 Signs You're Overpaying for a Property",
            excerpt: "Learn the subtle red flags that selling agents don't want you to spot during your next open home inspection.",
            date: "Feb 08, 2026",
            readTime: "4 min read",
            category: "Buying Strategy"
        },
        {
            title: "Securing a Dream Home Under Budget in Bondi",
            excerpt: "How one of our verified advocates saved a client $150k through strategic negotiation and off-market access.",
            date: "Jan 29, 2026",
            readTime: "6 min read",
            category: "Case Study"
        },
        {
            title: "The Hidden Costs of Buying Without Representation",
            excerpt: "From emotional overbidding to missing serious building defects, the cost of 'saving' on an agent can be massive.",
            date: "Jan 15, 2026",
            readTime: "7 min read",
            category: "Education"
        },
        {
            title: "Auction Strategies That Actually Work",
            excerpt: "Stop guessing. Here are the three proven bidding strategies that professional buyer's agents use to win auctions.",
            date: "Jan 03, 2026",
            readTime: "5 min read",
            category: "Auctions"
        },
        {
            title: "Off-Market Properties: The Truth",
            excerpt: "What exactly is an off-market listing, and how do you get access to them before they hit RealEstate.com.au?",
            date: "Dec 20, 2025",
            readTime: "4 min read",
            category: "Market Insights"
        }
    ];

    return (
        <div className="bg-white min-h-screen pt-40 pb-24">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="text-center space-y-4 mb-20 max-w-3xl mx-auto">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest border border-primary/10">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Insights &amp; Strategy
                    </div>
                    <h1 className="text-5xl md:text-7xl font-display font-black text-gray-900 tracking-tight">
                        Buyer <span className="text-primary">Intelligence.</span>
                    </h1>
                    <p className="text-xl text-stone font-medium leading-relaxed italic">
                        &quot;Expert advice to help you navigate the property maze.&quot;
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {posts.map((post, i) => (
                        <Card key={i} className="border-stone/10 rounded-[2.5rem] bg-white hover:shadow-soft transition-all duration-500 overflow-hidden group">
                            <CardContent className="p-0">
                                <div className="aspect-[16/10] bg-warm flex items-center justify-center text-gray-900 font-display font-black text-2xl group-hover:scale-105 transition-transform duration-700">
                                    BHQ / BLOG
                                </div>
                                <div className="p-10 space-y-6">
                                    <div className="flex items-center gap-4 text-[10px] font-mono font-bold text-stone uppercase tracking-widest">
                                        <span className="text-primary border-b-2 border-primary pb-1">{post.category}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                                    </div>
                                    <h3 className="text-2xl font-display font-black text-gray-900 tracking-tight leading-tight group-hover:text-primary transition-colors">
                                        {post.title}
                                    </h3>
                                    <p className="text-stone font-medium leading-relaxed line-clamp-2 italic">
                                        &quot;{post.excerpt}&quot;
                                    </p>
                                    <Button variant="ghost" className="p-0 text-gray-900 font-black flex items-center gap-2 hover:bg-transparent hover:text-primary group/btn">
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
