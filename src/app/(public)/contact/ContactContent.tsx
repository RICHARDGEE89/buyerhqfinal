"use client";

import React from 'react';
import { Mail, MessageSquare, Linkedin, Instagram, Facebook, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default function ContactContent() {
    return (
        <div className="bg-white min-h-screen">
            {/* Hero */}
            <section className="pt-40 pb-24 bg-topo relative">
                <div className="container mx-auto px-6 text-center space-y-6 max-w-4xl">
                    <h1 className="text-5xl md:text-7xl font-display font-black text-white tracking-tight leading-tight">
                        How can we <span className="text-teal">Help?</span>
                    </h1>
                    <p className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
                        Whether you&apos;re a buyer looking for advice or an agent wanting to join the directory, we&apos;d love to hear from you.
                    </p>
                </div>
            </section>

            {/* Main Grid */}
            <section className="py-24">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 max-w-6xl mx-auto">

                        {/* Contact Details */}
                        <div className="space-y-12">
                            <div className="space-y-6">
                                <h2 className="text-3xl font-display font-black text-midnight tracking-tight">Get in touch</h2>
                                <p className="text-lg text-stone font-medium leading-relaxed">
                                    Our team is available Monday to Friday, 9am - 5pm AEST.
                                    We aim to respond to all enquiries within 24 hours.
                                </p>
                            </div>

                            <div className="space-y-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-teal/10 flex items-center justify-center text-teal">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-mono font-bold text-stone uppercase tracking-widest">Email Support</div>
                                        <div className="text-xl font-bold text-midnight">hello@buyerhq.com.au</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-teal/10 flex items-center justify-center text-teal">
                                        <MessageSquare className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-mono font-bold text-stone uppercase tracking-widest">Business Enquiries</div>
                                        <div className="text-xl font-bold text-midnight">partners@buyerhq.com.au</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 pt-10 border-t border-stone/5">
                                <h3 className="text-sm font-black text-stone uppercase tracking-widest">Connect with us</h3>
                                <div className="flex items-center gap-4">
                                    <Link href="#" className="w-12 h-12 bg-warm rounded-xl flex items-center justify-center text-stone hover:bg-teal hover:text-white transition-all"><Linkedin className="w-5 h-5" /></Link>
                                    <Link href="#" className="w-12 h-12 bg-warm rounded-xl flex items-center justify-center text-stone hover:bg-teal hover:text-white transition-all"><Instagram className="w-5 h-5" /></Link>
                                    <Link href="#" className="w-12 h-12 bg-warm rounded-xl flex items-center justify-center text-stone hover:bg-teal hover:text-white transition-all"><Facebook className="w-5 h-5" /></Link>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <Card className="border-stone/10 rounded-[3rem] bg-white shadow-2xl relative">
                            <CardContent className="p-12 space-y-8">
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-mono font-bold text-stone uppercase tracking-widest ml-2">First Name</label>
                                            <Input placeholder="John" className="h-12 rounded-xl border-stone/10 px-4 font-medium" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-mono font-bold text-stone uppercase tracking-widest ml-2">Last Name</label>
                                            <Input placeholder="Doe" className="h-12 rounded-xl border-stone/10 px-4 font-medium" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-mono font-bold text-stone uppercase tracking-widest ml-2">Email Address</label>
                                        <Input placeholder="john@example.com" className="h-12 rounded-xl border-stone/10 px-4 font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-mono font-bold text-stone uppercase tracking-widest ml-2">Subject</label>
                                        <Input placeholder="General enquiry" className="h-12 rounded-xl border-stone/10 px-4 font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-mono font-bold text-stone uppercase tracking-widest ml-2">Message</label>
                                        <Textarea placeholder="How can we help?" className="min-h-[160px] rounded-2xl border-stone/10 p-6 font-medium" />
                                    </div>
                                </div>

                                <Button className="w-full h-16 bg-teal hover:bg-teal/90 text-white font-black rounded-2xl text-lg shadow-xl shadow-teal/20">
                                    Send Message
                                    <Send className="ml-2 w-5 h-5" />
                                </Button>

                                <p className="text-[10px] font-bold text-stone/40 uppercase tracking-widest text-center">
                                    By clicking send, you agree to our privacy policy.
                                </p>
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </section>
        </div>
    );
}
