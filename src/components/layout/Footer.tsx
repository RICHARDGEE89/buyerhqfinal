import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { Mail, Linkedin, Instagram, Facebook } from 'lucide-react';

export const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        directory: [
            { name: 'Find an Agent', href: '/agents' },
            { name: 'How It Works', href: '/how-it-works' },
            { name: 'Get Matched', href: '/get-matched' },
            { name: 'Why BuyerHQ', href: '/why-buyerhq' },
        ],
        company: [
            { name: 'About Us', href: '/about' },
            { name: 'Contact', href: '/contact' },
            { name: 'FAQ', href: '/faq' },
            { name: 'Privacy Policy', href: '/privacy' },
            { name: 'Terms of Service', href: '/terms' },
        ],
        professionals: [
            { name: 'list your agency', href: '/join' },
            { name: 'Agent Login', href: '/login' },
            { name: 'Blog', href: '/blog' },
            { name: 'Admin Console', href: '/admin-login' },
        ]
    };

    return (
        <footer className="bg-midnight pt-24 pb-12 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    <div className="space-y-6">
                        <Logo variant="white" />
                        <p className="text-stone font-medium leading-relaxed max-w-xs">
                            Australia&apos;s leading marketplace for verified buyer&apos;s advocacy.
                        </p>
                        <div className="flex items-center gap-4">
                            <Link href="#" className="text-white/60 hover:text-lime transition-colors"><Linkedin className="w-5 h-5" /></Link>
                            <Link href="#" className="text-white/60 hover:text-lime transition-colors"><Instagram className="w-5 h-5" /></Link>
                            <Link href="#" className="text-white/60 hover:text-lime transition-colors"><Facebook className="w-5 h-5" /></Link>
                            <Link href="mailto:hello@buyerhq.com.au" className="text-white/60 hover:text-lime transition-colors"><Mail className="w-5 h-5" /></Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-display font-bold text-lg mb-6">Directory</h4>
                        <ul className="space-y-4">
                            {footerLinks.directory.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-stone hover:text-lime transition-colors font-medium text-sm">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-display font-bold text-lg mb-6">Professionals</h4>
                        <ul className="space-y-4">
                            {footerLinks.professionals.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-stone hover:text-lime transition-colors font-medium text-sm">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-display font-bold text-lg mb-6">Support</h4>
                        <ul className="space-y-4">
                            {footerLinks.company.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-stone hover:text-lime transition-colors font-medium text-sm">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-white/40 text-xs font-mono">
                        &copy; {currentYear} BuyerHQ. All agents are independently licence-verified.
                    </p>
                    <div className="flex items-center gap-6 text-[10px] font-mono text-white/20 uppercase tracking-widest">
                        <span>Built in Australia</span>
                        <span className="w-1 h-1 bg-white/20 rounded-full" />
                        <span>Secure & Private</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};
