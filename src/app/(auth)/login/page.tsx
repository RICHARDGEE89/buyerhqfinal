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
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async () => {
        setLoading(true)
        setError(null)

        const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (authError) {
            setError(authError.message)
            setLoading(false)
            return
        }

        if (user) {
            // Check user role
            const { data: userData, error: roleError } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single()

            if (userData) {
                if (userData.role === 'admin') {
                    router.push('/admin') // Assuming /admin is the route
                } else if (userData.role === 'agent') {
                    router.push('/agent-portal')
                } else {
                    router.push('/dashboard')
                }
                router.refresh()
            } else {
                // Fallback if role fetch fails (shouldn't happen with triggers)
                console.error("Role fetch failed:", roleError)
                router.push('/dashboard')
            }
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-20 px-6">
            <Link href="/" className="mb-12">
                <Logo variant="default" />
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >
                <Card className="bg-white rounded-[3rem] p-10 md:p-12 shadow-2xl border border-stone/5 space-y-8">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-display font-black text-gray-900 tracking-tight">Welcome Back</h1>
                        <p className="text-stone font-medium">Access your BuyerHQ dashboard.</p>
                    </div>

                    <div className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm font-bold p-4 rounded-xl text-center">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono font-bold text-stone uppercase tracking-widest ml-4">Email Address</label>
                            <Input
                                placeholder="name@company.com"
                                className="h-14 rounded-xl border-stone/10 px-6 font-medium text-lg"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono font-bold text-stone uppercase tracking-widest ml-4">Password</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                className="h-14 rounded-xl border-stone/10 px-6 font-medium text-lg"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            />
                        </div>
                        <div className="text-right">
                            <Link href="#" className="text-xs font-bold text-primary hover:underline">Forgot password?</Link>
                        </div>
                    </div>

                    <Button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full h-16 bg-primary hover:bg-primary-700 text-white font-black rounded-2xl shadow-xl transition-all text-lg group disabled:opacity-50"
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>

                    <div className="text-center pt-4">
                        <p className="text-stone text-xs font-medium">
                            Don&apos;t have an account? <br className="sm:hidden" />
                            <Link href="/signup" className="text-primary font-bold hover:underline">Sign up for free</Link>
                        </p>
                    </div>
                </Card>

                <div className="mt-8 flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        Secure Session
                    </div>
                    <div className="w-1 h-1 rounded-full bg-gray-300" />
                    <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">
                        <LayoutDashboard className="w-4 h-4 text-primary" />
                        Buyer Portal
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
