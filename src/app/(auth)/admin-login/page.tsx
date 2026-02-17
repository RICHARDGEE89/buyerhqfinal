"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, ShieldAlert, Lock } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Sign in with Supabase
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            // Check if user is admin
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('role')
                .eq('id', authData.user.id)
                .single();

            if (userError) throw userError;

            if (userData.role !== 'admin') {
                await supabase.auth.signOut();
                throw new Error('Unauthorized: Admin access required');
            }

            // Redirect to admin dashboard
            router.push('/admin');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Login failed';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center py-20 px-6">
            <Link href="/" className="mb-12">
                <Logo variant="white" />
            </Link>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full"
            >
                <Card className="bg-white rounded-3xl p-12 shadow-2xl border border-border space-y-8">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-gray-900 mx-auto">
                            <ShieldAlert className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Access</h1>
                            <p className="text-muted text-sm font-medium">Internal System Control</p>
                        </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-900 uppercase tracking-wider ml-1">Email</label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@buyerhq.com.au"
                                className="h-14 rounded-xl border-border px-6 font-medium"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-900 uppercase tracking-wider ml-1">Password</label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="h-14 rounded-xl border-border px-6 font-medium"
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <p className="text-sm text-red-600 font-medium">{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-16 bg-gray-900 hover:bg-primary hover:text-gray-900 text-white font-bold rounded-2xl shadow-xl transition-all text-lg flex items-center justify-center gap-2 group"
                        >
                            <Lock className="w-5 h-5" />
                            {loading ? 'Authorizing...' : 'Authorize Session'}
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </form>

                    <div className="text-center">
                        <Link href="/login" className="text-xs font-semibold text-muted hover:text-gray-900 transition-colors">
                            Return to standard login
                        </Link>
                    </div>
                </Card>

                <p className="mt-10 text-center text-white/20 text-[10px] font-semibold uppercase tracking-wider max-w-xs mx-auto">
                    Unauthorized access attempts are logged and reported.
                </p>
            </motion.div>
        </div>
    );
}
