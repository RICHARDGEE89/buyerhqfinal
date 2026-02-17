"use client";

import React from 'react';
import { SearchBar } from '@/components/home/SearchBar';
import { motion } from 'framer-motion';

export const AgentSearchHeader = () => {
    return (
        <section className="pt-32 pb-16 bg-white relative">
            {/* Removed dark gradient overlay */}

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-display font-black text-gray-900 tracking-tight"
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
