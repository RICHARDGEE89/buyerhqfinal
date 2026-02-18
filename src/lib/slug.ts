function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function hashBase36(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36);
}

export function buildAgentSlug(name: string, email: string, index = 0) {
  const base = slugify(name) || slugify(email.split("@")[0] ?? "") || "agent";
  const fingerprint = hashBase36(email || base).slice(0, 7) || "x";
  const suffix = index > 0 ? `-${index + 1}` : "";
  return `${base}-${fingerprint}${suffix}`.slice(0, 96);
}
