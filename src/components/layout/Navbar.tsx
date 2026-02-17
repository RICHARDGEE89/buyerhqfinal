"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Find Agents', href: '/agents' },
        { name: 'How It Works', href: '/how-it-works' },
        { name: 'FAQ', href: '/faq' },
        { name: 'About', href: '/about' },
    ];

    return (
        <nav className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 py-4",
            isScrolled ? "bg-white/80 backdrop-blur-md border-b border-stone/10 py-3" : "bg-transparent"
        )}>
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link href="/">
                    <Logo />
                </Link>

                {/* Desktop Nav */}
                <div className="hidden lg:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "text-sm font-bold tracking-tight transition-colors hover:text-primary",
                                pathname === link.href ? "text-primary" : "text-gray-900"
                            )}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                <div className="hidden lg:flex items-center gap-4">
                    <Link href="/login" className="text-sm font-bold text-gray-900 hover:text-primary transition-colors">
                        Sign In
                    </Link>
                    <Link href="/join">
                        <Button size="sm" className="bg-primary hover:bg-primary-600 text-white rounded-full px-6 font-bold shadow-md">
                            list your agency
                        </Button>
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="lg:hidden text-gray-900"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 p-6 flex flex-col gap-6 animate-in slide-in-from-top duration-300">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-lg font-bold text-gray-900"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <hr className="border-gray-200" />
                    <div className="flex flex-col gap-4">
                        <Link href="/login" className="text-lg font-bold text-gray-900">Sign In</Link>
                        <Link href="/join">
                            <Button className="w-full bg-primary hover:bg-primary-600 text-white rounded-full font-bold h-12 shadow-md">
                                list your agency
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
};
