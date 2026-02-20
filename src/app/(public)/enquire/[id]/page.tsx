import type { Metadata } from "next";
import { notFound } from "next/navigation";

import EnquiryFormContent from "./EnquiryFormContent";
import { sanitizePublicAgent } from "@/lib/agent-compat";
import type { AgentRow } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

type Params = { id: string };

async function getAgent(identifier: string) {
  const supabase = createClient();

  const byId = await supabase.from("agents").select("*").eq("id", identifier).maybeSingle();
  if (byId.data) {
    return sanitizePublicAgent(byId.data as AgentRow);
  }

  const bySlug = await supabase.from("agents").select("*").eq("slug", identifier).maybeSingle();
  if (bySlug.data) {
    return sanitizePublicAgent(bySlug.data as AgentRow);
  }

  return null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const agent = await getAgent(params.id);
  if (!agent) {
    return {
      title: "Enquire | BuyerHQ",
      description: "Submit a brokered enquiry to a verified buyer's agent.",
    };
  }

  return {
    title: `Enquire with ${agent.name} | BuyerHQ`,
    description: `Submit a brokered enquiry to ${agent.name} through BuyerHQ.`,
  };
}

export default async function EnquirePage({ params }: { params: Params }) {
  const agent = await getAgent(params.id);
  if (!agent) notFound();

  return <EnquiryFormContent agent={agent} />;
}
