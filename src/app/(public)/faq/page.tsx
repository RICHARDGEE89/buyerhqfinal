import React from 'react';
import { Metadata } from 'next';
import { ArrowRight, HelpCircle } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

export const metadata: Metadata = {
    title: "FAQ | Frequently Asked Questions | BuyerHQ",
    description: "Find answers to common questions about using BuyerHQ to find a buyer's agent, our verification process, and how we help Australian property buyers.",
};

export default function FAQPage() {
    const faqs = [
        {
            q: "Is BuyerHQ free for property buyers?",
            a: "Yes! BuyerHQ is 100% free for buyers. You can search, compare, and message verified agents without ever paying a fee to our platform."
        },
        {
            q: "How do you verify agents?",
            a: "We manually verify every agent profile. This includes checking their current real estate/advocacy licence in their specific state, verifying their ABN, and auditing their professional history."
        },
        {
            q: "Do you take a commission from the agents?",
            a: "No. Unlike some referral sites, we do not take a percentage of the agent's fee. This ensures that the agents you find on our platform remain independent and focused solely on your best interests."
        },
        {
            q: "Can I use BuyerHQ for investment properties?",
            a: "Absolutely. Many of our listed agents specialise in investment strategy, portfolio building, and commercial property acquisition."
        },
        {
            q: "What if I can't find an agent in my specific suburb?",
            a: "Our network is growing daily. If you can't find a local expert in a specific pocket, try searching by major city or region, as many top buyer's agents operate across broad metropolitan areas."
        }
    ];

    return (
        <div className="bg-white min-h-screen pt-40 pb-24">
            <div className="container mx-auto px-6 max-w-3xl">
                <div className="text-center space-y-4 mb-20">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-teal/5 text-teal text-xs font-bold uppercase tracking-widest border border-teal/10">
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Common Questions
                    </div>
                    <h1 className="text-5xl font-display font-black text-midnight tracking-tight">
                        Support <span className="text-teal">&amp; FAQ.</span>
                    </h1>
                </div>

                <Accordion type="single" collapsible className="space-y-6">
                    {faqs.map((faq, i) => (
                        <AccordionItem key={i} value={`item-${i}`} className="border-stone/10 rounded-2xl overflow-hidden px-6 bg-warm/30">
                            <AccordionTrigger className="text-lg font-bold text-midnight text-left hover:no-underline py-6">
                                {faq.q}
                            </AccordionTrigger>
                            <AccordionContent className="text-stone font-medium leading-relaxed pb-8">
                                {faq.a}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>

                <div className="mt-20 p-10 bg-midnight rounded-[2.5rem] text-center space-y-6">
                    <h3 className="text-white text-2xl font-display font-black">Still have a question?</h3>
                    <p className="text-stone font-medium italic">&quot;Our team is here to help you navigate the agent selection process.&quot;</p>
                    <a href="/contact" className="inline-flex items-center text-teal font-black text-lg hover:underline gap-2">
                        Contact Support <ArrowRight className="w-5 h-5" />
                    </a>
                </div>
            </div>
        </div>
    );
}
