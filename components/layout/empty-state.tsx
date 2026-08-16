import { Inbox } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
};

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
}: EmptyStateProps) {
  return (
    <Card className="animate-fade-up border-dashed bg-card/60">
      <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 hover:scale-105">
          <Icon className="size-5" />
        </span>
        <div className="space-y-1.5">
          <p className="font-heading text-lg font-semibold tracking-tight">
            {title}
          </p>
          {description ? (
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {action}
      </CardContent>
    </Card>
  );
}
