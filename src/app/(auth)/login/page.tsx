"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    ArrowRight,
    ShieldCheck,
    LayoutDashboard,
} from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import Link from 'next/link';

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-topo flex flex-col items-center justify-center py-20 px-6">
            <Link href="/" className="mb-12">
                <Logo variant="white" />
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >
                <Card className="bg-white rounded-[3rem] p-10 md:p-12 shadow-2xl border border-stone/5 space-y-8">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-display font-black text-midnight tracking-tight">Welcome Back</h1>
                        <p className="text-stone font-medium">Access your BuyerHQ dashboard.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono font-bold text-stone uppercase tracking-widest ml-4">Email Address</label>
                            <Input placeholder="name@company.com" className="h-14 rounded-xl border-stone/10 px-6 font-medium text-lg" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono font-bold text-stone uppercase tracking-widest ml-4">Password</label>
                            <Input type="password" placeholder="••••••••" className="h-14 rounded-xl border-stone/10 px-6 font-medium text-lg" />
                        </div>
                        <div className="text-right">
                            <Link href="#" className="text-xs font-bold text-teal hover:underline">Forgot password?</Link>
                        </div>
                    </div>

                    <Button className="w-full h-16 bg-midnight hover:bg-teal text-white font-black rounded-2xl shadow-xl transition-all text-lg group">
                        Sign In
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>

                    <div className="text-center pt-4">
                        <p className="text-stone text-xs font-medium">
                            Don&apos;t have an account? <br className="sm:hidden" />
                            <Link href="/signup" className="text-teal font-bold hover:underline">Sign up for free</Link>
                        </p>
                    </div>
                </Card>

                <div className="mt-8 flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest">
                        <ShieldCheck className="w-4 h-4 text-teal" />
                        Secure Session
                    </div>
                    <div className="w-1 h-1 rounded-full bg-white/10" />
                    <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest">
                        <LayoutDashboard className="w-4 h-4 text-teal" />
                        Buyer Portal
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
