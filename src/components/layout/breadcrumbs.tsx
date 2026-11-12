"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { routeLabels } from "@/lib/navigation";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { papersById } from "@/lib/client-registry";

function truncate(value: string, max = 48) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();
  const projects = useWorkspaceStore((s) => s.data.projects);
  const collections = useWorkspaceStore((s) => s.data.collections);

  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [
    { label: "Overview", href: "/dashboard" },
  ];

  segments.forEach((segment, index) => {
    if (segment === "dashboard") return;
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const previous = segments[index - 1];
    let label = routeLabels[segment] ?? segment;

    if (previous === "discover") {
      label = papersById[segment]?.title ?? "Paper";
    } else if (previous === "projects") {
      label = projects.find((p) => p.id === segment)?.title ?? "Project";
    } else if (previous === "collections") {
      label = collections.find((c) => c.id === segment)?.name ?? "Collection";
    }

    crumbs.push({ label, href });
  });

  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
        {crumbs.map((crumb, index) => {
          const last = index === crumbs.length - 1;
          return (
            <li key={`${crumb.href}-${index}`} className="flex min-w-0 items-center gap-1.5">
              {index > 0 && (
                <ChevronRight className="size-3 shrink-0 text-border" aria-hidden />
              )}
              {last ? (
                <span
                  aria-current="page"
                  className="truncate font-medium text-foreground"
                  title={crumb.label}
                >
                  {truncate(crumb.label, 38)}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="truncate transition-colors hover:text-foreground"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
