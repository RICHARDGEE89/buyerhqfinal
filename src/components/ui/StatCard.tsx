import { Card } from "@/components/ui/Card";

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card className="p-4">
      <div className="space-y-1">
        <div className="font-mono text-label uppercase text-text-secondary">{label}</div>
        <div className="text-heading text-text-primary">{value}</div>
        {hint ? <div className="text-caption text-text-muted">{hint}</div> : null}
      </div>
    </Card>
  );
}
