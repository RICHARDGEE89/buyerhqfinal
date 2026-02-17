import { Agent } from '@/types';

export interface MatchCriteria {
    location?: string;
    propertyType?: string;
    goal?: string;
    budget?: string;
    timeline?: string;
}

/**
 * Calculates a match score (0-100) for an agent based on buyer criteria.
 * In a real production app, this would be a Supabase RPC call using PostGIS
 * and weighted SQL rankings, but this client-side logic demonstrates the engine.
 */
export function calculateMatchScore(agent: Partial<Agent>, criteria: MatchCriteria): number {
    let score = 0;

    // 1. Geography (Primary factor)
    // If location matches primary suburb or state
    if (criteria.location && agent.primary_suburb?.toLowerCase().includes(criteria.location.toLowerCase())) {
        score += 40;
    } else if (criteria.location && agent.primary_state?.toLowerCase().includes(criteria.location.toLowerCase())) {
        score += 20;
    }

    // 2. Specialisation (Property Type / Goal)
    const specs = agent.specialisations || [];
    if (criteria.propertyType && specs.some(s => s.toLowerCase().includes(criteria.propertyType!.toLowerCase()))) {
        score += 20;
    }
    if (criteria.goal && specs.some(s => s.toLowerCase().includes(criteria.goal!.toLowerCase()))) {
        score += 15;
    }

    // 3. Performance Metrics
    // Reward experience and high ratings
    if ((agent.years_experience || 0) >= 10) score += 10;
    if ((agent.rating || 0) >= 4.5) score += 10;
    if (agent.licence_verified) score += 5;

    return Math.min(score, 100);
}

/**
 * Ranks and returns top matches from a list of agents.
 */
export function getTopMatches(agents: Partial<Agent>[], criteria: MatchCriteria, limit: number = 3): (Partial<Agent> & { matchScore: number })[] {
    return agents
        .map(agent => ({
            ...agent,
            matchScore: calculateMatchScore(agent, criteria)
        }))
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
        .slice(0, limit);
}
