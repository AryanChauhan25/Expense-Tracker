import { AlertTriangle, Info, TriangleAlert } from "lucide-react";

import type { BudgetAlert } from "@/features/budget/queries";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type BudgetAlertsProps = {
  alerts: BudgetAlert[];
};

export function BudgetAlerts({ alerts }: BudgetAlertsProps) {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const Icon =
          alert.severity === "danger"
            ? TriangleAlert
            : alert.severity === "warning"
              ? AlertTriangle
              : Info;

        return (
          <Alert
            key={alert.id}
            variant={alert.severity === "danger" ? "destructive" : "default"}
          >
            <Icon />
            <AlertTitle>
              {alert.severity === "danger"
                ? "Overspending"
                : alert.severity === "warning"
                  ? "Watch closely"
                  : "Heads up"}
            </AlertTitle>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
}
