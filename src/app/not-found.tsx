import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function NotFound() {
  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-10">
      <Card className="w-full max-w-xl p-8 text-center">
        <p className="font-mono text-label uppercase text-text-secondary">404</p>
        <h1 className="mt-2 text-display text-text-primary">Page not found</h1>
        <p className="mt-3 text-body text-text-secondary">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
