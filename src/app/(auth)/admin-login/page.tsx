"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, ShieldAlert, Lock } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import Link from 'next/link';

export default function AdminLoginPage() {
    return (
        <div className="min-h-screen bg-midnight flex flex-col items-center justify-center py-20 px-6">
            <Link href="/" className="mb-12">
                <Logo variant="white" />
            </Link>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full"
            >
                <Card className="bg-white rounded-[3.5rem] p-12 shadow-2xl border-4 border-amber/20 space-y-10">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-amber/10 rounded-2xl flex items-center justify-center text-amber mx-auto">
                            <ShieldAlert className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-3xl font-display font-black text-midnight tracking-tight uppercase">Admin Access</h1>
                            <p className="text-stone font-mono text-[10px] font-bold uppercase tracking-widest">Internal System Control</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono font-bold text-stone uppercase tracking-widest ml-4">Administrator ID</label>
                            <Input placeholder="admin-ref-001" className="h-14 rounded-xl border-stone/10 px-6 font-medium" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono font-bold text-stone uppercase tracking-widest ml-4">Access Token</label>
                            <Input type="password" placeholder="••••••••" className="h-14 rounded-xl border-stone/10 px-6 font-medium" />
                        </div>
                    </div>

                    <Button className="w-full h-16 bg-midnight hover:bg-amber hover:text-midnight text-white font-black rounded-2xl shadow-xl transition-all text-lg flex items-center justify-center gap-2 group">
                        <Lock className="w-5 h-5" />
                        Authorize Session
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>

                    <div className="text-center">
                        <Link href="/login" className="text-xs font-bold text-stone hover:text-midnight transition-colors">
                            Return to standard login
                        </Link>
                    </div>
                </Card>

                <p className="mt-10 text-center text-white/20 text-[10px] font-mono font-bold uppercase tracking-[0.2em] max-w-xs mx-auto">
                    Unauthorized access attempts are logged and reported.
                </p>
            </motion.div>
        </div>
    );
}
