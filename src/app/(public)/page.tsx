import React from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { TrustBar } from '@/components/home/TrustBar';
import { HowItWorks } from '@/components/home/HowItWorks';
import { FeaturedAgents } from '@/components/agents/FeaturedAgents';
import { WhyBuyerHQ } from '@/components/home/WhyBuyerHQ';
import { LocationGrid } from '@/components/home/LocationGrid';
import { MatchCTA } from '@/components/home/MatchCTA';
import { FAQSection } from '@/components/home/FAQSection';
import { LatestInsights } from '@/components/home/LatestInsights';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <TrustBar />
      <HowItWorks />
      <FeaturedAgents />
      <WhyBuyerHQ />
      <LocationGrid />
      <LatestInsights />
      <MatchCTA />
      <FAQSection />
    </div>
  );
}
