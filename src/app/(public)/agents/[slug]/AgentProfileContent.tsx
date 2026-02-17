"use client";

import React from 'react';
import {
    Star,
    ShieldCheck,
    Mail,
    ChevronRight,
    TrendingUp,
    Briefcase,
    PlayCircle,
    MapPin,
    Calendar,
    ExternalLink,
    MessageSquare,
    BadgeCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RatingStars } from '@/components/brand/Badges';

interface Review {
    id: number;
    author: string;
    rating: number;
    body: string;
    date: string;
}

interface CaseStudy {
    id: number;
    suburb: string;
    type: string;
    saving: string;
    days: number;
}

interface AgentProfile {
    business_name: string;
    primary_suburb: string;
    primary_state: string;
    licence_verified: boolean;
    years_experience: number;
    total_properties: number;
    avg_days_to_purchase: number;
    specialisations: string[];
    bio: string;
    video_intro_url: boolean;
    headshot_url: string | null;
    reviews: Review[];
    case_studies: CaseStudy[];
}

export default function AgentProfileContent({ agent }: { agent: AgentProfile }) {
    return (
        <div className="min-h-screen bg-topo flex flex-col pt-24">
            <main className="flex-1 container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Sidebar / Contact Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-32 space-y-8">
                            <Card className="border-stone/5 rounded-[3rem] overflow-hidden bg-white shadow-2xl">
                                <div className="p-8 md:p-10 space-y-8">
                                    <div className="aspect-square rounded-[2rem] bg-gray-900 relative overflow-hidden group">
                                        <div className="absolute inset-0 flex items-center justify-center font-display font-black text-6xl text-white/10 group-hover:scale-110 transition-transform duration-700">
                                            {agent.business_name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        {agent.video_intro_url && (
                                            <button className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/20 hover:bg-gray-900/40 transition-all group/play">
                                                <PlayCircle className="w-16 h-16 text-white group-hover/play:scale-110 transition-transform" />
                                                <span className="mt-4 text-xs font-mono font-bold text-white uppercase tracking-widest">Watch Intro</span>
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <h1 className="text-3xl font-display font-black text-gray-900 tracking-tight leading-tight">
                                            {agent.business_name}
                                        </h1>
                                        <div className="flex flex-wrap gap-3">
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-warm/50 text-[10px] font-mono font-bold text-stone uppercase tracking-widest">
                                                <MapPin className="w-3.5 h-3.5" />
                                                {agent.primary_suburb}, {agent.primary_state}
                                            </div>
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-warm/50 text-[10px] font-mono font-bold text-stone uppercase tracking-widest">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {agent.years_experience}+ Years
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-8 border-t border-stone/5">
                                        <Button className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl shadow-xl shadow-teal/20 text-lg group">
                                            Enquire Now
                                            <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                        <Button variant="outline" className="w-full h-16 border-stone/10 text-gray-900 font-bold rounded-2xl hover:bg-warm/20 transition-all">
                                            <Mail className="w-5 h-5 mr-3" />
                                            Send Message
                                        </Button>
                                    </div>
                                </div>
                            </Card>

                            <Card className="border-stone/10 rounded-[2.5rem] bg-gray-900 text-white p-8 space-y-4">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="w-5 h-5 text-primary" />
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">BuyerHQ Guarantee</h4>
                                </div>
                                <p className="text-sm text-white/40 font-medium leading-relaxed">
                                    This agent has undergone our 7-step verification process, including direct ABN and licence audit.
                                </p>
                            </Card>
                        </div>
                    </div>

                    {/* Main Profile Content */}
                    <div className="lg:col-span-2 space-y-16">

                        {/* Stats / Overview */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Properties Bought', value: agent.total_properties, icon: TrendingUp },
                                { label: 'Avg Purchase Days', value: agent.avg_days_to_purchase, icon: Briefcase },
                                { label: 'Licence Status', value: 'Verified', icon: BadgeCheck },
                                { label: 'Specialisations', value: agent.specialisations.length, icon: Star }
                            ].map((stat, i) => (
                                <Card key={i} className="border-stone/5 rounded-3xl bg-white p-6 shadow-soft group hover:border-primary/20 transition-all">
                                    <div className="w-10 h-10 rounded-xl bg-warm/50 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-all">
                                        <stat.icon className="w-5 h-5" />
                                    </div>
                                    <div className="text-2xl font-mono font-black text-gray-900 leading-none mb-1">
                                        {i === 1 ? `${stat.value}d` : stat.value}
                                    </div>
                                    <div className="text-[9px] font-bold text-stone uppercase tracking-widest leading-tight">
                                        {stat.label}
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* About */}
                        <div className="space-y-6">
                            <h2 className="text-3xl font-display font-black text-white tracking-tight">About {agent.business_name}</h2>
                            <p className="text-xl text-white/40 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: agent.bio }} />
                        </div>

                        {/* Specialisations */}
                        <div className="space-y-8">
                            <h2 className="text-3xl font-display font-black text-white tracking-tight">Expertise</h2>
                            <div className="flex flex-wrap gap-4">
                                {agent.specialisations.map((spec) => (
                                    <Badge key={spec} className="px-6 py-3 rounded-2xl bg-white/5 border-white/10 text-white font-bold text-sm backdrop-blur-md">
                                        {spec}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Results / Case Studies */}
                        <div className="space-y-12 bg-white rounded-[3rem] p-12 md:p-16">
                            <div className="space-y-8">
                                <h2 className="text-3xl font-display font-black text-gray-900 tracking-tight">Recent Success Stories</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {agent.case_studies.map((cs) => (
                                        <Card key={cs.id} className="border-stone/5 rounded-[2rem] overflow-hidden bg-warm/10 shadow-sm group hover:border-primary/20 transition-all">
                                            <CardContent className="p-8 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-primary" />
                                                        <span className="font-bold text-gray-900">{cs.suburb}</span>
                                                    </div>
                                                    <Badge className="bg-primary/10 text-primary border-primary/20 rounded-lg text-[10px] font-black uppercase">
                                                        {cs.type}
                                                    </Badge>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-stone/5">
                                                    <div>
                                                        <div className="text-[10px] font-mono font-bold text-stone uppercase tracking-widest">Savings</div>
                                                        <div className="text-xl font-mono font-black text-gray-900">{cs.saving}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-mono font-bold text-stone uppercase tracking-widest">Time to Buy</div>
                                                        <div className="text-xl font-mono font-black text-gray-900">{cs.days}d</div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-8 pt-12 border-t border-stone/5">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <h2 className="text-3xl font-display font-black text-gray-900 tracking-tight">Client Feedback</h2>
                                    <RatingStars rating={4.9} count={24} variant="dark" />
                                </div>

                                <div className="space-y-6">
                                    {agent.reviews.map((review) => (
                                        <div key={review.id} className="p-8 rounded-[2.5rem] border border-stone/10 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary uppercase text-xs">
                                                        {review.author[0]}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 text-sm">{review.author}</div>
                                                        <div className="text-[10px] font-medium text-stone uppercase tracking-wider">{review.date}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-3.5 h-3.5 fill-lime text-primary" />)}
                                                </div>
                                            </div>
                                            <p className="text-stone font-medium text-sm leading-relaxed mb-6 italic">
                                                &quot;{review.body}&quot;
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Agency Links */}
                        <div className="flex items-center gap-8 pt-12 border-t border-white/5">
                            {/* External links removed until DB support added */}
                        </div>

                    </div>

                </div>
            </main>

            {/* Sticky Mobile CTA */}
            <div className="lg:hidden fixed bottom-10 inset-x-6 z-50">
                <Button className="w-full h-16 bg-primary text-white font-black rounded-2xl shadow-2xl shadow-teal/40 text-lg group">
                    Contact Agent
                    <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}
