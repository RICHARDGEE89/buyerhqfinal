export function isMissingColumnError(message: string, column: string, table?: string) {
  const lower = message.toLowerCase();
  const hasMissingColumnShape = lower.includes("column") && lower.includes("does not exist");
  if (!hasMissingColumnShape) return false;

  const columnMatch = lower.includes(column.toLowerCase());
  if (!columnMatch) return false;

  if (!table) return true;
  return lower.includes(table.toLowerCase());
}

export function isMissingRelationError(message: string, relation: string) {
  const lower = message.toLowerCase();
  return (
    lower.includes("relation") &&
    lower.includes(relation.toLowerCase()) &&
    lower.includes("does not exist")
  );
}

export function isPolicyRecursionError(message: string) {
  const lower = message.toLowerCase();
  return lower.includes("infinite recursion detected in policy");
}

export function isOnConflictConstraintError(message: string) {
  const lower = message.toLowerCase();
  return (
    lower.includes("no unique or exclusion constraint matching the on conflict specification") ||
    lower.includes("42p10")
  );
}

export function extractMissingColumnName(message: string, tableName?: string) {
  const tableToken = tableName ? tableName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : "[a-zA-Z0-9_]+";
  const patterns = [
    new RegExp(`${tableToken}\\.([a-zA-Z0-9_]+)`, "i"),
    /column\s+"?([a-zA-Z0-9_]+)"?\s+does not exist/i,
    /could not find the '([a-zA-Z0-9_]+)' column of/i,
    /column\s+([a-zA-Z0-9_]+)\s+of relation/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

export function extractNotNullColumnName(message: string) {
  const patterns = [
    /null value in column\s+"?([a-zA-Z0-9_]+)"?\s+of relation/i,
    /violates not-null constraint.*column\s+"?([a-zA-Z0-9_]+)"?/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}
