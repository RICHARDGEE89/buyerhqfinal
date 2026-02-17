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
                        isWhite ? "text-white" : "text-primary",
                        isMidnight && "text-white"
                    )}
                    fill={isWhite ? "white" : "currentColor"}
                    fillOpacity={0.1}
                />
                <Home
                    className={cn(
                        "w-4 h-4 absolute",
                        // Default (Light BG): Primary (Grey-600)
                        !isWhite && !isMidnight && "text-primary",
                        // White Variant: Primary (Grey-600) - even if 'white' variant is requested, we want it visible
                        isWhite && "text-primary",
                        // Midnight Variant: Dark
                        isMidnight && "text-gray-900"
                    )}
                />
            </div>

            {/* Wordmark */}
            {!iconOnly && (
                <span className={cn(
                    "font-display text-2xl font-black tracking-tight",
                    isWhite ? "text-white" : "text-gray-900",
                    isMidnight && "text-white"
                )}>
                    Buyer<span className={cn(isWhite ? "text-white/80" : "text-primary")}>HQ</span>
                </span>
            )}
        </div>
    );
};
