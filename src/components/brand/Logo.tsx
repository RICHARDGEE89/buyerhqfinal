import React from 'react';
import { Shield, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
    className?: string;
    iconOnly?: boolean;
    variant?: 'default' | 'white' | 'midnight';
}

export const Logo: React.FC<LogoProps> = ({
    className,
    iconOnly = false,
    variant = 'default'
}) => {
    const isWhite = variant === 'white';
    const isMidnight = variant === 'midnight';

    return (
        <div className={cn("inline-flex items-center gap-2 group cursor-pointer", className)}>
            {/* Icon Mark: Shield + House */}
            <div className="relative flex items-center justify-center">
                <Shield
                    className={cn(
                        "w-8 h-8 transition-transform group-hover:scale-110 duration-300",
                        isWhite ? "text-white" : "text-lime",
                        isMidnight && "text-white"
                    )}
                    fill={isWhite ? "white" : "currentColor"}
                    fillOpacity={0.1}
                />
                <Home
                    className={cn(
                        "w-4 h-4 absolute text-white",
                        isWhite ? "text-lime" : "text-white",
                        isMidnight && "text-midnight"
                    )}
                />
            </div>

            {/* Wordmark */}
            {!iconOnly && (
                <span className={cn(
                    "font-display text-2xl font-black tracking-tight",
                    isWhite ? "text-white" : "text-midnight",
                    isMidnight && "text-white"
                )}>
                    Buyer<span className={cn(isWhite ? "text-white/80" : "text-lime")}>HQ</span>
                </span>
            )}
        </div>
    );
};
