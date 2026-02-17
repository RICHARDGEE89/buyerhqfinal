"use client";

import React from 'react';
import { SearchBar } from '@/components/home/SearchBar';
import { motion } from 'framer-motion';

export const AgentSearchHeader = () => {
    return (
        <section className="pt-32 pb-16 bg-topo relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,186,188,0.1)_0,rgba(13,27,42,0)_70%)] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-display font-black text-white tracking-tight"
                    >
                        Find Your <span className="text-primary">Property Expert</span>
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <SearchBar className="max-w-2xl" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
