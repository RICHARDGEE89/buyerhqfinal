"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Award, ChevronRight, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VerifiedBadge, RatingStars } from '@/components/brand/Badges';
import { Agent } from '@/types';
import { cn } from '@/lib/utils';

interface AgentCardProps {
    agent: Partial<Agent>;
    className?: string;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, className }) => {
    return (
        <Link href={`/agents/${agent.slug}`} className={cn("group block", className)}>
            <Card className="overflow-hidden border-stone/10 group-hover:border-ocean/30 group-hover:shadow-soft transition-all duration-500 bg-white rounded-[2rem] flex flex-col h-full hover:-translate-y-2">
                <CardContent className="p-0 flex flex-col h-full">
                    {/* Top section: Headshot + Primary Info */}
                    <div className="p-8 bg-warm/30 flex flex-col items-center justify-center border-b border-stone/5 relative overflow-hidden">
                        <div className="absolute top-4 right-4 flex flex-col gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-sm text-stone/40 hover:text-coral transition-colors"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                            >
                                <Heart className="w-5 h-5" />
                            </Button>
                        </div>

                        {agent.licence_verified && (
                            <div className="absolute top-4 left-4">
                                <VerifiedBadge showText={false} className="p-2" />
                            </div>
                        )}

                        {/* Avatar Placeholder / Image */}
                        <div className="w-24 h-24 rounded-3xl bg-ocean/10 flex items-center justify-center mb-4 border-4 border-white shadow-lg overflow-hidden group-hover:scale-110 transition-transform duration-500">
                            {agent.headshot_url ? (
                                <Image
                                    src={agent.headshot_url}
                                    alt={agent.business_name || ""}
                                    width={96}
                                    height={96}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="text-ocean font-display font-black text-3xl">BHQ</div>
                            )}
                        </div>

                        <h3 className="text-xl font-display font-black text-midnight mb-1 tracking-tight text-center">
                            {agent.business_name}
                        </h3>
                        <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-stone uppercase tracking-[0.2em] mb-1">
                            {agent.primary_suburb}, {agent.primary_state}
                        </div>
                    </div>

                    {/* Bottom section: Details/Bio */}
                    <div className="p-8 flex-1 space-y-6 flex flex-col">
                        <div className="space-y-3">
                            <RatingStars rating={4.8} count={24} />
                            <p className="text-sm text-stone font-medium leading-relaxed line-clamp-2">
                                {agent.bio || "Boutique buyer's agency specializing in off-market deals and investment strategy."}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {agent.specialisations?.slice(0, 3).map(spec => (
                                <Badge key={spec} variant="secondary" className="bg-sky text-ocean border-transparent font-bold px-3 py-1 text-[10px] uppercase tracking-wider rounded-lg">
                                    {spec}
                                </Badge>
                            ))}
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-stone/5 mt-auto">
                            <div className="flex items-center gap-2 text-xs font-bold text-midnight">
                                <div className="w-6 h-6 bg-sky rounded-lg flex items-center justify-center">
                                    <Award className="w-3.5 h-3.5 text-ocean" />
                                </div>
                                {agent.years_experience || 10}+ Years
                            </div>
                            <Button className="bg-midnight group-hover:bg-ocean text-white font-black h-10 px-6 rounded-xl transition-all shadow-lg flex items-center gap-2">
                                View Profile
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
};
