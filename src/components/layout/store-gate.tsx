/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { apiFetch } from "@/lib/api-client";

function AppSkeleton() {
  return (
    <div className="min-h-dvh bg-background">
      <div className="fixed inset-y-0 left-0 hidden w-[248px] flex-col border-r border-border bg-sidebar px-4 py-5 lg:flex">
        <div className="flex items-center gap-2.5">
          <Skeleton className="size-7 rounded-[3px]" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-14" />
            <Skeleton className="h-2 w-20" />
          </div>
        </div>
        <Skeleton className="mt-6 h-9 w-full" />
        <div className="mt-8 space-y-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-4 rounded-[3px]" />
              <Skeleton className="h-3 flex-1" style={{ maxWidth: `${60 + (i % 4) * 8}%` }} />
            </div>
          ))}
        </div>
      </div>
      <div className="lg:pl-[248px]">
        <div className="flex h-14 items-center gap-4 border-b border-border px-6">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="ml-auto h-8 w-64" />
          <Skeleton className="size-8 rounded-full" />
        </div>
        <div className="mx-auto max-w-[1400px] p-6">
          <div className="flex items-end justify-between">
            <div className="space-y-2">
              <Skeleton className="h-2.5 w-24" />
              <Skeleton className="h-8 w-80" />
              <Skeleton className="h-3 w-96 max-w-full" />
            </div>
            <Skeleton className="h-9 w-32" />
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-md" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function StoreGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hydrated = useWorkspaceStore((s) => s.hydrated);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const session = await apiFetch<{ user: any }>("/api/auth/session");
        if (cancelled) return;
        if (!session?.user) {
          router.replace("/signin");
          return;
        }
        await useWorkspaceStore.getState().hydrate();
      } catch {
        if (!cancelled) router.replace("/signin");
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => { cancelled = true; };
  }, [router]);

  if (checking || !hydrated) return <AppSkeleton />;

  return <>{children}</>;
}
