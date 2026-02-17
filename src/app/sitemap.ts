import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://buyerhq.com.au';

    // Static routes
    const routes = [
        '',
        '/agents',
        '/about',
        '/contact',
        '/how-it-works',
        '/pricing',
        '/get-matched',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // In a real app, we would fetch all agent slugs from Supabase here
    const agents = [
        'prestige-property-group',
    ].map((slug) => ({
        url: `${baseUrl}/agents/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
    }));

    return [...routes, ...agents];
}
