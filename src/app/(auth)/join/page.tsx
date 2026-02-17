"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck,
    Briefcase,
    MapPin,
    ArrowRight,
    ArrowLeft,
    FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/brand/Logo';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const steps = [
    { id: 'account', title: 'Account Details', icon: ShieldCheck },
    { id: 'business', title: 'Business Info', icon: Briefcase },
    { id: 'experience', title: 'Experience & Stats', icon: FileText },
    { id: 'specialties', title: 'Specialisations', icon: MapPin }
];

export default function AgentJoinPage() {
    const [currentStep, setCurrentStep] = useState(0);

    const progress = ((currentStep + 1) / steps.length) * 100;

    const handleNext = () => currentStep < steps.length - 1 && setCurrentStep(currentStep + 1);
    const handleBack = () => currentStep > 0 && setCurrentStep(currentStep - 1);

    return (
        <div className="min-h-screen bg-topo flex flex-col items-center py-20 px-6">
            <Link href="/" className="mb-12">
                <Logo variant="white" />
            </Link>

            <div className="max-w-3xl w-full space-y-8">
                {/* Step Indicator */}
                <div className="flex justify-between items-center bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-md">
                    {steps.map((s, i) => (
                        <div key={s.id} className="flex flex-col items-center gap-2 relative">
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                                i <= currentStep ? "bg-teal text-white shadow-lg shadow-teal/20" : "bg-white/10 text-white/40"
                            )}>
                                <s.icon className="w-5 h-5" />
                            </div>
                            <span className={cn(
                                "hidden md:block text-[9px] font-mono font-bold uppercase tracking-widest",
                                i <= currentStep ? "text-white" : "text-white/20"
                            )}>
                                {s.title}
                            </span>
                        </div>
                    ))}
                </div>

                <Progress value={progress} className="h-1.5 bg-white/10" />

                <CardContent className="bg-white rounded-[3rem] p-12 md:p-16 shadow-2xl border border-stone/5 space-y-10 min-h-[500px] flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            {/* Render Step Content */}
                            {currentStep === 0 && (
                                <div className="space-y-6 text-center">
                                    <h2 className="text-3xl font-display font-black text-midnight tracking-tight">Create your Agent Account</h2>
                                    <p className="text-stone font-medium text-sm">Join Australia&apos;s verified network of property experts.</p>
                                    <div className="space-y-4 pt-4">
                                        <Input placeholder="Email address" className="h-14 rounded-xl border-stone/10 px-6 font-medium text-lg" />
                                        <Input type="password" placeholder="Create password" className="h-14 rounded-xl border-stone/10 px-6 font-medium text-lg" />
                                    </div>
                                </div>
                            )}

                            {currentStep === 1 && (
                                <div className="space-y-6 text-center">
                                    <h2 className="text-3xl font-display font-black text-midnight tracking-tight">Business Identity</h2>
                                    <p className="text-stone font-medium text-sm">Tell us about your agency brand.</p>
                                    <div className="space-y-4 pt-4">
                                        <Input placeholder="Agency / Trading Name" className="h-14 rounded-xl border-stone/10 px-6 font-medium text-lg" />
                                        <Input placeholder="Primary Office Location" className="h-14 rounded-xl border-stone/10 px-6 font-medium text-lg" />
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-6 text-center">
                                    <h2 className="text-3xl font-display font-black text-midnight tracking-tight">Experience &amp; Stats</h2>
                                    <p className="text-stone font-medium text-sm">Showcase your track record to potential buyers.</p>
                                    <div className="grid grid-cols-2 gap-4 pt-4">
                                        <Input placeholder="Years Exp" className="h-14 rounded-xl border-stone/10 px-6 font-medium text-lg" />
                                        <Input placeholder="Properties Bought" className="h-14 rounded-xl border-stone/10 px-6 font-medium text-lg" />
                                        <Input placeholder="Avg Rating" className="h-14 rounded-xl border-stone/10 px-6 font-medium text-lg" />
                                        <Input placeholder="Avg Days to Buy" className="h-14 rounded-xl border-stone/10 px-6 font-medium text-lg" />
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="space-y-6 text-center">
                                    <h2 className="text-3xl font-display font-black text-midnight tracking-tight">Specialisations</h2>
                                    <p className="text-stone font-medium text-sm">List the suburbs and asset types you excel in.</p>
                                    <div className="space-y-4 pt-4">
                                        <Input placeholder="Key Suburbs (e.g. Bondi, Sydney CBD)" className="h-14 rounded-xl border-stone/10 px-6 font-medium text-lg" />
                                        <Input placeholder="Property Types (e.g. Luxury, Unit, Family Home)" className="h-14 rounded-xl border-stone/10 px-6 font-medium text-lg" />
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    <div className="pt-10 mt-auto flex items-center justify-between border-t border-stone/5">
                        <button
                            onClick={handleBack}
                            disabled={currentStep === 0}
                            className="flex items-center gap-2 text-stone font-bold hover:text-midnight transition-colors disabled:opacity-0"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back
                        </button>

                        <Button
                            onClick={() => currentStep === steps.length - 1 ? alert("Application Received! We will verify your credentials.") : handleNext()}
                            className="h-16 px-12 bg-teal hover:bg-teal/90 text-white font-black rounded-2xl shadow-xl shadow-teal/20 text-lg group"
                        >
                            {currentStep === steps.length - 1 ? 'Finish Registry' : 'Continue'}
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </CardContent>

                <p className="text-center text-white/40 text-[10px] font-mono font-bold uppercase tracking-[0.2em]">
                    All applications undergo manual expert verification.
                </p>
            </div>
        </div>
    );
}

// Minimal CardContent component since it was being used
function CardContent({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div className={className}>{children}</div>;
}
