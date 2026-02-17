import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/dashboard/',
                '/agent-portal/',
                '/admin-panel/',
                '/api/',
            ],
        },
        sitemap: 'https://buyerhq.com.au/sitemap.xml',
    };
}
