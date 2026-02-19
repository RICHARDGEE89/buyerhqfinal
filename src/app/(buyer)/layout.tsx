import { redirect } from "next/navigation";

import { BuyerPortalShell } from "@/components/portal/BuyerPortalShell";
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

  return <BuyerPortalShell>{children}</BuyerPortalShell>;
}
