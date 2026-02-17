"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ChevronLeft,
    MapPin,
    Home,
    Target,
    DollarSign,
    Clock,
    CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const steps = [
    {
        id: 'location',
        title: 'Where are you looking?',
        desc: 'Enter the suburb or region where you want to buy.',
        icon: MapPin,
    },
    {
        id: 'type',
        title: 'Property Type',
        desc: 'What kind of property are you interested in?',
        icon: Home,
        options: ['House', 'Apartment / Unit', 'Townhouse', 'Land / New Build', 'Commercial']
    },
    {
        id: 'purpose',
        title: 'Your Goal',
        desc: 'Is this for you to live in, or an investment?',
        icon: Target,
        options: ['Primary Residence', 'Investment Property', 'Vacation / Second Home']
    },
    {
        id: 'budget',
        title: 'Your Budget',
        desc: 'What is your comfortable price range?',
        icon: DollarSign,
        options: ['Under $750k', '$750k - $1.5M', '$1.5M - $3M', '$3M - $5M', '$5M+']
    },
    {
        id: 'timeline',
        title: 'Buying Timeline',
        desc: 'How soon are you looking to settle?',
        icon: Clock,
        options: ['ASAP / Ready to buy', 'Within 3 months', '3 - 6 months', 'Just researching']
    }
];

export default function MatchQuizContent() {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<Record<string, string>>({});

    const progress = ((currentStep + 1) / steps.length) * 100;

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            const params = new URLSearchParams(formData).toString();
            window.location.href = `/get-matched/results?${params}`;
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const selectOption = (opt: string) => {
        setFormData({ ...formData, [steps[currentStep].id]: opt });
        setTimeout(() => handleNext(), 300); // Small delay for visual feedback
    };

    const step = steps[currentStep];

    return (
        <div className="min-h-screen pt-32 pb-20 flex flex-col items-center bg-topo">
            <div className="max-w-2xl w-full px-6 space-y-8">

                {/* Progress Bar */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <div className="text-[10px] font-mono font-bold text-sky/60 uppercase tracking-[0.2em]">
                            Step {currentStep + 1} of {steps.length}
                        </div>
                        <div className="text-[10px] font-mono font-black text-white uppercase tracking-widest bg-ocean/20 px-3 py-1 rounded-full border border-white/10">
                            {Math.round(progress)}% Complete
                        </div>
                    </div>
                    <Progress value={progress} className="h-2 bg-white/10" />
                </div>

                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-[3rem] p-10 md:p-14 shadow-2xl border border-stone/5 space-y-10"
                >
                    <div className="space-y-4 text-center">
                        <div className="w-16 h-16 bg-sky rounded-2xl flex items-center justify-center text-ocean mx-auto mb-6">
                            <step.icon className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-display font-black text-midnight tracking-tight">
                            {step.title}
                        </h2>
                        <p className="text-stone font-medium text-lg leading-relaxed max-w-sm mx-auto">
                            {step.desc}
                        </p>
                    </div>

                    <div className="space-y-3">
                        {step.id === 'location' ? (
                            <div className="space-y-6">
                                <Input
                                    placeholder="e.g. Bondi, Sydney"
                                    className="h-16 rounded-2xl border-stone/10 bg-warm/20 text-lg font-bold px-6 focus:ring-ocean focus:border-ocean transition-all"
                                    value={formData.location || ''}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && handleNext()}
                                />
                                <Button
                                    onClick={handleNext}
                                    disabled={!formData.location}
                                    className="w-full h-16 bg-midnight text-white text-xl font-black rounded-2xl shadow-xl shadow-midnight/20 disabled:opacity-50"
                                >
                                    Continue
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {step.options?.map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => selectOption(opt)}
                                        className={cn(
                                            "flex items-center justify-between p-6 rounded-2xl border-2 transition-all group hover:scale-[1.02] active:scale-[0.98]",
                                            formData[step.id] === opt
                                                ? "border-ocean bg-sky/50 shadow-lg shadow-ocean/5"
                                                : "border-stone/5 bg-warm/10 hover:border-ocean/30 hover:bg-white"
                                        )}
                                    >
                                        <span className={cn(
                                            "text-lg font-bold tracking-tight",
                                            formData[step.id] === opt ? "text-ocean" : "text-midnight"
                                        )}>
                                            {opt}
                                        </span>
                                        <div className={cn(
                                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                            formData[step.id] === opt
                                                ? "border-ocean bg-ocean text-white"
                                                : "border-stone/20"
                                        )}>
                                            {formData[step.id] === opt && <CheckCircle2 className="w-4 h-4" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="pt-6 flex items-center justify-between">
                        <button
                            onClick={handleBack}
                            disabled={currentStep === 0}
                            className="flex items-center gap-2 text-stone font-bold hover:text-midnight transition-colors disabled:opacity-0"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            Back
                        </button>
                        <div className="text-[10px] font-mono font-bold text-stone/40 uppercase tracking-widest">
                            BuyerHQ Personalised Match
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
