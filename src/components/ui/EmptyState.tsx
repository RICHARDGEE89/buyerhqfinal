import { SearchX } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function EmptyState({
  title = "No results found",
  description = "Try adjusting your filters and search terms.",
  actionLabel,
  onAction,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Card className="p-8 text-center">
      <div className="mx-auto mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-text-secondary">
        <SearchX size={18} />
      </div>
      <h3 className="text-subheading text-text-primary">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-body-sm text-text-secondary">{description}</p>
      {actionLabel && onAction ? (
        <div className="mt-4">
          <Button variant="secondary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
