import { redirect } from "next/navigation";

import { isAdminEmail } from "@/lib/admin-access";
import { createClient } from "@/lib/supabase/server";
import { AdminPortalShell } from "@/components/portal/AdminPortalShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin-login?next=/admin");
  }
  if (!isAdminEmail(user.email)) {
    const { data: profileRow } = await supabase
      .from("agent_profiles")
      .select("agent_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profileRow?.agent_id) {
      redirect("/agent-portal");
    }
    redirect("/dashboard");
  }

  return <AdminPortalShell>{children}</AdminPortalShell>;
}
