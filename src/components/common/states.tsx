"use client";

import { AlertCircle, Database, RefreshCw } from "lucide-react";
import { Button, Card, CardContent, Skeleton } from "@/components/ui";

export function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header bar skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-48" />
      </div>

      {/* Hero Vitality card skeleton */}
      <Skeleton className="h-36 w-full rounded-2xl" />

      {/* Metric Cards Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((n) => (
          <Skeleton key={n} className="h-36 rounded-2xl" />
        ))}
      </div>

      {/* Charts Grid Skeleton */}
      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}

export function ErrorState({
  message = "Unable to reach monitoring server.",
  retry,
}: {
  message?: string;
  retry?: () => void;
}) {
  return (
    <Card className="border-rose-500/20 bg-rose-500/5 dark:border-rose-500/20 dark:bg-rose-950/10">
      <CardContent className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Connection Interrupted
        </h3>
        <p className="mt-1.5 max-w-md text-sm text-slate-500 dark:text-slate-400">
          {message}
        </p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          The backend API server may be spinning up on Render.
        </p>
        {retry && (
          <Button
            className="mt-6 gap-2"
            variant="outline"
            onClick={retry}
          >
            <RefreshCw className="h-4 w-4" />
            Retry Connection
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="border-dashed border-slate-200 dark:border-white/10">
      <CardContent className="flex min-h-56 flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
          <Database className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          {title}
        </h3>
        {description && (
          <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
        {action && <div className="mt-5">{action}</div>}
      </CardContent>
    </Card>
  );
}
