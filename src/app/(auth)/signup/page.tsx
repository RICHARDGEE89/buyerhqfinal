"use client";

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, ShieldCheck, Star, Lock } from 'lucide-react';

const benefits = [
    { title: 'Privacy Guaranteed', desc: 'Your details only go to the agents you choose. No spam.', icon: Lock },
    { title: 'Verified Experts', desc: 'Every agent is licence-verified.', icon: ShieldCheck },
    { title: 'Personalised Matching', desc: "Find agents based on your goals.", icon: Star },
    { title: 'Independent Reviews', desc: 'Read honest buyer feedback.', icon: CheckCircle2 }
];

export default function SignupPage() {
    return (
        <div className="min-h-screen bg-topo flex flex-col items-center justify-center p-6">
            <Link href="/" className="mb-12">
                <Logo variant="white" />
            </Link>

            <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-[3rem] shadow-2xl overflow-hidden">

                {/* Left: Benefits recap */}
                <div className="hidden lg:flex flex-col justify-center p-16 bg-midnight text-white space-y-10">
                    <div className="space-y-4">
                        <h2 className="text-4xl font-display font-black tracking-tight leading-tight">
                            Start your journey <br />
                            <span className="text-teal">to the right home.</span>
                        </h2>
                        <p className="text-white/40 font-medium leading-relaxed">
                            Join thousands of buyers who use BuyerHQ to find local property experts.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {benefits.map((b) => (
                            <div key={b.title} className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-teal">
                                    <b.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-bold text-sm tracking-tight">{b.title}</div>
                                    <div className="text-xs text-stone font-medium mt-0.5">{b.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-10 border-t border-white/5">
                        <p className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest text-center mt-6">
                            Official Marketplace • Secured & Verified
                        </p>
                    </div>
                </div>

                {/* Right: Signup form */}
                <CardContent className="p-10 md:p-16 space-y-8 flex flex-col justify-center">
                    <div className="text-center lg:text-left space-y-2">
                        <h1 className="text-3xl font-display font-black text-midnight tracking-tight">Create your Account</h1>
                        <p className="text-stone font-medium text-sm">
                            Free to search, compare, and save agents.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-mono font-bold text-stone uppercase tracking-widest ml-2">First Name</label>
                                <Input placeholder="John" className="h-12 rounded-xl border-stone/10 px-4 font-medium" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-mono font-bold text-stone uppercase tracking-widest ml-2">Last Name</label>
                                <Input placeholder="Doe" className="h-12 rounded-xl border-stone/10 px-4 font-medium" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono font-bold text-stone uppercase tracking-widest ml-2">Email Address</label>
                            <Input placeholder="john@example.com" className="h-12 rounded-xl border-stone/10 px-4 font-medium" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono font-bold text-stone uppercase tracking-widest ml-2">Password</label>
                            <Input type="password" placeholder="••••••••" className="h-12 rounded-xl border-stone/10 px-4 font-medium" />
                        </div>
                    </div>

                    <Button
                        onClick={() => alert("Registration system active. Please complete the form.")}
                        className="w-full h-16 bg-teal hover:bg-teal/90 text-white font-black rounded-2xl shadow-xl shadow-teal/20 text-lg active:scale-95 transition-all"
                    >
                        Create Free Account
                    </Button>

                    <div className="text-center">
                        <p className="text-stone text-xs font-medium">
                            Already have an account? <Link href="/login" className="text-teal font-bold hover:underline">Log in</Link>
                        </p>
                    </div>

                    <div className="bg-warm/30 p-4 rounded-xl border border-stone/5">
                        <p className="text-[10px] text-stone font-medium text-center leading-relaxed">
                            By creating an account, you agree to our <Link href="#" className="underline">Terms</Link> and <Link href="#" className="underline">Privacy Policy</Link>.
                        </p>
                    </div>
                </CardContent>

            </div>
        </div>
    );
}
