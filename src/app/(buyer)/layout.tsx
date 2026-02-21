import { redirect } from "next/navigation";

import { BuyerPortalShell } from "@/components/portal/BuyerPortalShell";
import { isAdminEmail } from "@/lib/admin-access";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function BuyerLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  if (isAdminEmail(user.email)) {
    redirect("/admin");
  }

  const { data: profileRow, error: profileError } = await supabase
    .from("agent_profiles")
    .select("agent_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profileError && profileRow?.agent_id) {
    redirect("/agent-portal");
  }

  return <BuyerPortalShell>{children}</BuyerPortalShell>;
}
