"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Heart,
    MessageSquare,
    UserCircle,
    LogOut,
    ChevronRight
} from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Saved Agents', href: '/dashboard/saved', icon: Heart },
    { name: 'My Enquiries', href: '/dashboard/enquiries', icon: MessageSquare },
    { name: 'Profile', href: '/dashboard/profile', icon: UserCircle },
];

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-warm/30 flex">
            {/* Sidebar */}
            <aside className="hidden lg:flex w-72 bg-midnight flex-col p-6 sticky top-0 h-screen">
                <div className="mb-12 px-2">
                    <Logo variant="white" />
                    <div className="mt-2 text-[10px] font-mono font-bold text-ocean uppercase tracking-[0.2em] px-1">
                        Buyer Portal
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center justify-between p-4 rounded-2xl transition-all group",
                                pathname === item.href
                                    ? "bg-white/10 text-white"
                                    : "text-white/40 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className={cn(
                                    "w-5 h-5",
                                    pathname === item.href ? "text-ocean" : "text-white/20 group-hover:text-white/40"
                                )} />
                                <span className="font-bold text-sm tracking-tight">{item.name}</span>
                            </div>
                            {pathname === item.href && <ChevronRight className="w-4 h-4 text-ocean" />}
                        </Link>
                    ))}
                </nav>

                <div className="pt-8 border-t border-white/5">
                    <Button variant="ghost" className="w-full justify-start text-white/40 hover:text-coral hover:bg-coral/5 rounded-2xl p-4 h-auto">
                        <LogOut className="w-5 h-5 mr-3" />
                        <span className="font-bold text-sm tracking-tight">Log Out</span>
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Mobile Nav Header */}
                <header className="lg:hidden bg-midnight p-4 flex items-center justify-between">
                    <Logo variant="white" iconOnly />
                    <div className="text-[10px] font-mono font-bold text-ocean uppercase tracking-widest">
                        Dashboard
                    </div>
                    <button className="text-white p-2">
                        <UserCircle className="w-6 h-6" />
                    </button>
                </header>

                <main className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
