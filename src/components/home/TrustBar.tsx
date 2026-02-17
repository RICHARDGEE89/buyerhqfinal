import React from 'react';

interface StatItemProps {
    label: string;
    value: string | number;
    suffix?: string;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, suffix }) => (
    <div className="flex flex-col items-center justify-center p-6 text-center">
        <div className="text-3xl md:text-4xl font-mono font-black text-midnight flex items-baseline gap-1">
            {value}
            {suffix && <span className="text-lg text-ocean">{suffix}</span>}
        </div>
        <div className="text-xs font-bold text-stone uppercase tracking-widest mt-1">
            {label}
        </div>
    </div>
);

export const TrustBar = () => {
    // In a real app, these values would be fetched from Supabase
    const stats = [
        { label: "Verified Agents", value: 142 },
        { label: "States Covered", value: 8 },
        { label: "Enquiries MTD", value: "2.4", suffix: "k" },
        { label: "Avg Response", value: "<1", suffix: "hr" }
    ];

    return (
        <div className="bg-white border-y border-stone/5 shadow-sm py-2">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 divide-x divide-stone/5">
                {stats.map((stat) => (
                    <StatItem key={stat.label} {...stat} />
                ))}
            </div>
        </div>
    );
};
