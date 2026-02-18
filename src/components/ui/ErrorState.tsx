import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function ErrorState({
  title = "Something went wrong",
  description = "We could not load this content right now.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <Card className="border-destructive/40 bg-destructive/10 p-8 text-center">
      <div className="mx-auto mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-destructive/50 text-destructive">
        <AlertTriangle size={18} />
      </div>
      <h3 className="text-subheading text-text-primary">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-body-sm text-text-secondary">{description}</p>
      {onRetry ? (
        <div className="mt-4">
          <Button variant="destructive" onClick={onRetry}>
            Retry
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
