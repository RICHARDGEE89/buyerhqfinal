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
