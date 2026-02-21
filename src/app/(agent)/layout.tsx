import { redirect } from "next/navigation";

import { AgentPortalShell } from "@/components/portal/AgentPortalShell";
import { isAdminEmail } from "@/lib/admin-access";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/agent-portal/login?next=/agent-portal");
  }

  if (isAdminEmail(user.email)) {
    redirect("/admin");
  }

  const { data: profileRow, error } = await supabase
    .from("agent_profiles")
    .select("agent_id")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profileRow?.agent_id) {
    redirect("/agent-portal/login?next=/agent-portal");
  }

  return <AgentPortalShell>{children}</AgentPortalShell>;
}
