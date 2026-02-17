"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    BarChart4,
    ShieldAlert,
    Users2,
    Settings2,
    Database,
    Search,
    FileText,
    LogOut
} from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
    { name: 'System Overview', href: '/admin', icon: BarChart4 },
    { name: 'Verifications', href: '/admin/verifications', icon: ShieldAlert, alert: 5 },
    { name: 'Directory Management', href: '/admin/agents', icon: Database },
    { name: 'User Management', href: '/admin/users', icon: Users2 },
    { name: 'System Logs', href: '/admin/logs', icon: FileText },
    { name: 'Global Settings', href: '/admin/settings', icon: Settings2 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-[#F1F5F9] flex">
            {/* Sidebar */}
            <aside className="hidden lg:flex w-72 bg-midnight flex-col p-6 sticky top-0 h-screen shadow-2xl z-50">
                <div className="mb-12 px-2 flex flex-col items-center">
                    <Logo variant="white" iconOnly />
                    <div className="mt-4 text-[10px] font-mono font-black text-coral uppercase tracking-[0.4em] bg-coral/10 px-3 py-1 rounded-full border border-coral/20">
                        Internal Admin
                    </div>
                </div>

                <nav className="flex-1 space-y-1.5">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center justify-between p-4 rounded-2xl transition-all group",
                                pathname === item.href
                                    ? "bg-white/10 text-white border border-white/10"
                                    : "text-white/30 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className={cn(
                                    "w-4 h-4 transition-colors",
                                    pathname === item.href ? "text-ocean" : "text-white/20 group-hover:text-white/40"
                                )} />
                                <span className="font-bold text-[13px] tracking-tight">{item.name}</span>
                            </div>
                            {item.alert && (
                                <div className="w-5 h-5 rounded-full bg-coral flex items-center justify-center text-[10px] font-black text-white shadow-lg">
                                    {item.alert}
                                </div>
                            )}
                        </Link>
                    ))}
                </nav>

                <div className="pt-8 border-t border-white/5">
                    <Button variant="ghost" className="w-full justify-start text-white/30 hover:text-coral hover:bg-coral/5 rounded-2xl p-4 h-auto">
                        <LogOut className="w-4 h-4 mr-3" />
                        <span className="font-bold text-[13px] tracking-tight">Main Terminal Exit</span>
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Top Header */}
                <header className="h-20 bg-white border-b border-stone/5 px-10 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center gap-3 text-stone font-bold text-xs uppercase tracking-widest bg-warm/30 px-4 py-2 rounded-xl">
                        <Search className="w-3.5 h-3.5" />
                        <span className="text-stone/40">Global Search Terminal...</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-verified/10 rounded-full border border-verified/20">
                            <div className="w-2 h-2 rounded-full bg-verified animate-pulse" />
                            <span className="text-[10px] font-black text-verified uppercase tracking-widest">System Online</span>
                        </div>
                        <div className="h-8 w-px bg-stone/5" />
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-midnight border-2 border-white shadow-lg flex items-center justify-center text-white font-display font-black text-xs">
                                AD
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-10 max-w-[1600px] w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
