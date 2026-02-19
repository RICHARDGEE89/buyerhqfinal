const ADMIN_EMAILS = ["richardgoodwin@live.com", "cam.dirtymack@gmail.com"] as const;

export const adminAllowList = new Set<string>(ADMIN_EMAILS);

export function isAdminEmail(email: string | null | undefined) {
  return adminAllowList.has((email ?? "").toLowerCase());
}
