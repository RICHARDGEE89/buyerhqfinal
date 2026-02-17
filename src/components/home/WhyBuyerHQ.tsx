import React from 'react';
import { ShieldCheck, Star, Users, Heart, Clock, Zap, BarChart, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const FeatureRow = ({ icon: Icon, text }: { icon: React.ElementType, text: string }) => (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-stone/5 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Icon className="w-5 h-5" />
        </div>
        <span className="font-bold text-gray-900 text-sm tracking-tight">{text}</span>
    </div>
);

export const WhyBuyerHQ = () => {
    return (
        <section className="py-32 bg-white">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">

                    {/* FOR BUYERS */}
                    <div className="space-y-10">
                        <div className="space-y-4">
                            <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight leading-tight text-gray-900">
                                Peace of mind for <br />
                                <span className="text-primary">Home Buyers.</span>
                            </h2>
                            <p className="text-lg text-stone font-medium leading-relaxed max-w-lg">
                                Avoid the stress of searching alone. We only list agents who meet our strict quality and licensing criteria.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FeatureRow icon={ShieldCheck} text="All agents licence-verified" />
                            <FeatureRow icon={Star} text="Read real buyer reviews" />
                            <FeatureRow icon={Users} text="Free to search & compare" />
                            <FeatureRow icon={Heart} text="Save favourite agents" />
                            <FeatureRow icon={Clock} text="Fast response times" />
                            <FeatureRow icon={BadgeCheck} text="Independent platform" />
                        </div>

                        <div className="pt-4">
                            <Link href="/agents">
                                <Button className="bg-gray-900 hover:bg-gray-900/90 text-white font-bold h-14 px-10 rounded-2xl shadow-xl shadow-midnight/20 text-lg group">
                                    Find an Agent Free
                                    <Zap className="ml-2 w-4 h-4 text-primary fill-lime opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* FOR AGENTS */}
                    <div className="space-y-10 bg-warm/50 p-10 md:p-16 rounded-[3rem] border border-stone/5">
                        <div className="space-y-4">
                            <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight leading-tight text-gray-900 text-left">
                                Grow your business <br />
                                <span className="text-primary">as an Expert.</span>
                            </h2>
                            <p className="text-lg text-stone font-medium leading-relaxed max-w-lg">
                                Reach active buyers searching for property in your area right now.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FeatureRow icon={Users} text="Reach active local buyers" />
                            <FeatureRow icon={BadgeCheck} text="Verified Badge credibility" />
                            <FeatureRow icon={BarChart} text="Lead & Analytics dashboard" />
                            <FeatureRow icon={Zap} text="Priority local placement" />
                        </div>

                        <div className="pt-4">
                            <Link href="/join">
                                <Button variant="outline" className="border-stone/20 text-gray-900 hover:bg-white hover:border-primary transition-all font-bold h-14 px-10 rounded-2xl text-lg w-full sm:w-auto">
                                    List Your Profile
                                </Button>
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};
