export type UserRole = 'buyer' | 'agent' | 'admin';

export interface User {
    id: string;
    role: UserRole;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
}

export type FeeModel = 'percentage' | 'fixed' | 'tiered' | 'hybrid';
export type AgentStatus = 'pending' | 'active' | 'suspended' | 'rejected';
export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'premium';

export interface Agent {
    id: string;
    user_id: string;
    slug: string;
    business_name: string;
    abn: string;
    abn_verified: boolean;
    licence_number: string;
    licence_state: 'NSW' | 'VIC' | 'QLD' | 'WA' | 'SA' | 'TAS' | 'ACT' | 'NT';
    licence_verified: boolean;
    licence_document_url?: string;
    rebaa_member: boolean;
    rebaa_number?: string;
    headshot_url?: string;
    bio?: string;
    video_intro_url?: string;
    years_experience?: number;
    total_properties: number;
    avg_days_to_purchase?: number;
    specialisations: string[];
    fee_model: FeeModel;
    fee_min?: number;
    fee_max?: number;
    fee_description?: string;
    website_url?: string;
    linkedin_url?: string;
    suburb_coverage: string[];
    coverage_radius_km: number;
    primary_suburb?: string;
    primary_state?: string;
    avg_response_hours?: number;
    accepting_clients: boolean;
    status: AgentStatus;
    featured: boolean;
    subscription_tier: SubscriptionTier;
    profile_views: number;
    rating?: number;
    review_count?: number;
    admin_notes?: string;
    created_at: string;
    updated_at: string;
}


export interface Review {
    id: string;
    agent_id: string;
    buyer_id: string;
    rating: number;
    title: string;
    body: string;
    suburb_bought?: string;
    property_type?: string;
    verified: boolean;
    status: 'pending' | 'published' | 'rejected';
    agent_response?: string;
    agent_response_at?: string;
    helpful_count: number;
    created_at: string;
}

export interface Enquiry {
    id: string;
    agent_id: string;
    buyer_id?: string;
    buyer_name: string;
    buyer_email: string;
    buyer_phone?: string;
    budget_min?: number;
    budget_max?: number;
    target_suburb?: string;
    buyer_type?: string;
    timeline?: string;
    message: string;
    status: 'new' | 'read' | 'replied' | 'closed';
    source?: string;
    created_at: string;
}
