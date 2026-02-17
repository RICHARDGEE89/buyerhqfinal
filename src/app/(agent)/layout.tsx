"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    BarChart3,
    Users,
    ShieldCheck,
    CreditCard,
    Settings,
    LogOut,
    Bell,
    Search,
    ExternalLink
} from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
    { name: 'Dashboard', href: '/agent-portal', icon: BarChart3 },
    { name: 'Leads & Enquiries', href: '/agent-portal/leads', icon: Users },
    { name: 'Profile & Verification', href: '/agent-portal/profile', icon: ShieldCheck },
    { name: 'Subscription & Billing', href: '/agent-portal/billing', icon: CreditCard },
    { name: 'Site Settings', href: '/agent-portal/settings', icon: Settings },
];

export default function AgentLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex">
            {/* Sidebar */}
            <aside className="hidden lg:flex w-80 bg-gray-900 flex-col p-8 sticky top-0 h-screen shadow-2xl z-50">
                <div className="mb-14 px-2">
                    <Logo variant="white" />
                    <div className="mt-2 text-[10px] font-mono font-bold text-primary/40 uppercase tracking-[0.3em] px-1">
                        Agent Command Center
                    </div>
                </div>

                <nav className="flex-1 space-y-3">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center justify-between p-5 rounded-3xl transition-all group",
                                pathname === item.href
                                    ? "bg-primary text-white shadow-xl shadow-teal/20"
                                    : "text-white/40 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <item.icon className={cn(
                                    "w-5 h-5 transition-colors",
                                    pathname === item.href ? "text-white" : "text-white/20 group-hover:text-white/40"
                                )} />
                                <span className="font-bold text-sm tracking-tight">{item.name}</span>
                            </div>
                            {pathname === item.href && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />}
                        </Link>
                    ))}
                </nav>

                <div className="pt-10 border-t border-white/5 space-y-4">
                    <Link href="/agents/prestige-property-group" target="_blank">
                        <Button variant="ghost" className="w-full justify-start text-primary hover:text-white hover:bg-primary/10 rounded-2xl p-4 h-auto">
                            <ExternalLink className="w-5 h-5 mr-3" />
                            <span className="font-bold text-sm tracking-tight">View Live Profile</span>
                        </Button>
                    </Link>
                    <Button variant="ghost" className="w-full justify-start text-white/30 hover:text-primary hover:bg-primary/5 rounded-2xl p-4 h-auto">
                        <LogOut className="w-5 h-5 mr-3" />
                        <span className="font-bold text-sm tracking-tight">Log Out</span>
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Top Header */}
                <header className="h-24 bg-white border-b border-stone/5 px-12 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center gap-4 bg-warm/30 px-6 py-3 rounded-2xl border border-stone/5">
                        <Search className="w-4 h-4 text-stone" />
                        <input
                            type="text"
                            placeholder="Search leads..."
                            className="bg-transparent border-none outline-none text-sm font-medium w-64"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative p-2 text-stone hover:text-gray-900 transition-colors">
                            <Bell className="w-6 h-6" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white" />
                        </button>
                        <div className="h-10 w-px bg-stone/5" />
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-sm font-black text-gray-900 tracking-tight">Prestige Property Group</div>
                                <div className="text-[10px] font-bold text-verified uppercase tracking-widest">Verified Partner</div>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center text-white font-display font-black">
                                PP
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-12 max-w-[1600px] w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
