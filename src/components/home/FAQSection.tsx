import React from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
    {
        q: "How much does BuyerHQ cost for home buyers?",
        a: "BuyerHQ is 100% free for home buyers to search, compare, and connect with agents. We receive a small listing fee from agents to be on the platform, but this never affects the transparency of our data or the reviews you see."
    },
    {
        q: "How do you verify the agents on the platform?",
        a: "Every agent must undergo a manual verification process. We verify their current real estate licence in their respective state, check their ABN, and ensure they are active professionals in their local market. We also verify 'Success Stories' and reviews wherever possible."
    },
    {
        q: "Can I use BuyerHQ if I'm a first home buyer?",
        a: "Absolutely. Many of the agents on our platform specialize in helping first home buyers navigate the complexity of their first purchase, including state grants and auction bidding."
    },
    {
        q: "What is a Buyer's Agent exactly?",
        a: "Unlike a traditional real estate agent who works for the seller to get the highest price, a buyer's agent works exclusively for you, the buyer. They find properties (including off-market ones), handle negotiations, and ensure you buy the right property at the right price."
    },
    {
        q: "How does the Match Quiz work?",
        a: "Our algorithm analyzes your budget, location, and property goals against our agent database. We look at an agent's recent purchase history, localized knowledge, and specializations to recommend the top 3 experts for your specific needs."
    }
];

export function FAQSection() {
    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-6 max-w-3xl">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-display font-black text-gray-900 tracking-tight">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-stone font-medium text-lg leading-relaxed">
                        Everything you need to know about finding your agent on BuyerHQ.
                    </p>
                </div>

                <Accordion type="single" collapsible className="w-full space-y-4">
                    {faqs.map((faq, i) => (
                        <AccordionItem
                            key={i}
                            value={`item-${i}`}
                            className="border border-stone/10 rounded-2xl px-6 bg-warm/20 overflow-hidden"
                        >
                            <AccordionTrigger className="text-left font-bold text-gray-900 py-6 hover:no-underline hover:text-primary transition-colors">
                                {faq.q}
                            </AccordionTrigger>
                            <AccordionContent className="text-stone font-medium leading-relaxed pb-6">
                                {faq.a}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}
