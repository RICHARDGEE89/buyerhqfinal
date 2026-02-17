import React from 'react';
import { BadgeCheck, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerifiedBadgeProps {
    className?: string;
    showText?: boolean;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ className, showText = true }) => {
    return (
        <div className={cn("inline-flex items-center gap-1.5 bg-verified/10 text-verified px-2 py-0.5 rounded-full", className)}>
            <BadgeCheck className="w-4 h-4" />
            {showText && <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Licence Verified</span>}
        </div>
    );
};

interface RatingStarsProps {
    rating: number;
    count?: number;
    className?: string;
    variant?: 'light' | 'dark';
}

export const RatingStars: React.FC<RatingStarsProps> = ({ rating, count, className, variant = 'light' }) => {
    return (
        <div className={cn("flex items-center gap-1.5", className)}>
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={cn(
                            "w-4 h-4",
                            star <= rating ? "text-amber fill-amber" : "text-stone/20 fill-stone/20"
                        )}
                    />
                ))}
            </div>
            {(rating > 0 || count !== undefined) && (
                <span className={cn(
                    "text-sm font-mono font-black",
                    variant === 'dark' ? "text-white" : "text-midnight"
                )}>
                    {rating.toFixed(1)} {count !== undefined && <span className={cn(
                        "font-medium font-sans",
                        variant === 'dark' ? "text-white/40" : "text-stone"
                    )}>({count})</span>}
                </span>
            )}
        </div>
    );
};
