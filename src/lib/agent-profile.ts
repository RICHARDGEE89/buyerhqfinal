import type { SupabaseClient, User } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";

export async function resolveAgentProfileForUser(
  supabase: SupabaseClient<Database>,
  user: User
): Promise<{ agentId: string | null; error: string | null }> {
  const { data: profile, error: profileError } = await supabase
    .from("agent_profiles")
    .select("agent_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return { agentId: null, error: profileError.message };
  }

  if (profile?.agent_id) {
    return { agentId: profile.agent_id, error: null };
  }

  const email = user.email?.toLowerCase() ?? "";
  if (!email) {
    return { agentId: null, error: "No email on current account." };
  }

  const { data: agent, error: agentError } = await supabase
    .from("agents")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (agentError) {
    return { agentId: null, error: agentError.message };
  }

  if (!agent?.id) {
    return { agentId: null, error: null };
  }

  const { error: upsertError } = await supabase.from("agent_profiles").upsert({
    id: user.id,
    agent_id: agent.id,
  });

  if (upsertError) {
    return { agentId: null, error: upsertError.message };
  }

  return { agentId: agent.id, error: null };
}

export function toStateCode(input: string | null | undefined): Database["public"]["Tables"]["agents"]["Row"]["state"] {
  const value = (input ?? "").toUpperCase();
  const allowed = new Set(["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"]);
  return allowed.has(value) ? (value as Database["public"]["Tables"]["agents"]["Row"]["state"]) : null;
}
