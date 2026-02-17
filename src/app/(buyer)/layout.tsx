"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Heart,
    MessageSquare,
    UserCircle,
    LogOut,
    ChevronRight,
    Menu,
    X
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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white flex">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-72 bg-white border-r border-gray-200 flex-col p-6 sticky top-0 h-screen">
                <div className="mb-10 px-2">
                    <Logo variant="default" />
                </div>

                <nav className="space-y-2 flex-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all group",
                                pathname === item.href
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5 transition-colors",
                                pathname === item.href ? "text-primary" : "text-gray-400 group-hover:text-primary"
                            )} />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="mt-auto pt-6 border-t border-gray-100">
                    <Button variant="ghost" className="w-full justify-start text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-2xl p-4 h-auto">
                        <LogOut className="w-5 h-5 mr-3 text-gray-400" />
                        <span className="font-bold">Sign Out</span>
                    </Button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <Logo variant="default" className="scale-75 origin-left" />
                <button className="text-gray-900 p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>
        </div>
    );
}
