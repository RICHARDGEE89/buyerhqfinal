import React from 'react';
import { notFound } from 'next/navigation';
import AgentProfileContent from './AgentProfileContent';
import { Metadata } from 'next';

interface AgentProfile {
    business_name: string;
    primary_suburb: string;
    primary_state: string;
    licence_verified: boolean;
    years_experience: number;
    total_properties: number;
    avg_days_to_purchase: number;
    specialisations: string[];
    bio: string;
    video_intro_url: boolean;
    headshot_url: string | null;
    reviews: { id: number; author: string; rating: number; body: string; date: string }[];
    case_studies: { id: number; suburb: string; type: string; saving: string; days: number }[];
}

// Mock function to simulate data fetching
const getAgentBySlug = (slug: string): AgentProfile | undefined => {
    const agents: Record<string, AgentProfile> = {
        'prestige-property-group': {
            business_name: 'Prestige Property Group',
            primary_suburb: 'Double Bay',
            primary_state: 'NSW',
            licence_verified: true,
            years_experience: 15,
            total_properties: 124,
            avg_days_to_purchase: 28,
            specialisations: ['Luxury Homes', 'Off-Market Deals', 'Investment Strategy'],
            bio: "Prestige Property Group is Sydney's premier buyer's advocacy firm. We specialise in securing high-value residential and investment properties for select clients. Our deep local networks and rigorous analysis ensure you never overpay and always get first access to off-market opportunities.",
            video_intro_url: true,
            headshot_url: null,
            reviews: [
                { id: 1, author: 'Sarah J.', rating: 5, body: "They found our dream home in Bondi before it even hit the market. Saved us months of searching and likely hundreds of thousands at auction.", date: '2 weeks ago' },
                { id: 2, author: 'Michael R.', rating: 5, body: "Absolute professionals. Their negotiation strategy was flawless. Highly recommended for anyone looking in the Eastern Suburbs.", date: '1 month ago' }
            ],
            case_studies: [
                { id: 1, suburb: 'Vaucluse', type: 'Residential', saving: '$245k', days: 14 },
                { id: 2, suburb: 'Bellevue Hill', type: 'Luxury Apartment', saving: '$110k', days: 22 }
            ]
        }
    };
    return agents[slug];
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const agent = getAgentBySlug(params.slug);

    if (!agent) {
        return {
            title: 'Agent Not Found',
        };
    }

    return {
        title: `${agent.business_name} | Verified Buyer's Agent in ${agent.primary_suburb}`,
        description: `View ${agent.business_name}'s verified profile, recent success stories, and reviews. Specialising in ${agent.specialisations.slice(0, 2).join(' & ')} in ${agent.primary_suburb}, ${agent.primary_state}.`,
        openGraph: {
            title: `${agent.business_name} | Verified Buyer's Agent`,
            description: `Australia's premier directory for verified buyer's agents. Transparent, trustworthy, and free for buyers.`,
            images: agent.headshot_url ? [agent.headshot_url] : [],
        },
    };
}

export default function AgentProfilePage({ params }: { params: { slug: string } }) {
    const agent = getAgentBySlug(params.slug);

    if (!agent) {
        notFound();
    }

    return <AgentProfileContent agent={agent} />;
}
