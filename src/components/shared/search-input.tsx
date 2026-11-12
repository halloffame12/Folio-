"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export const SearchInput = forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
    onClear?: () => void;
    wrapperClassName?: string;
    size?: "default" | "lg";
  }
>(({ className, wrapperClassName, onClear, value, size = "default", ...props }, ref) => (
  <div className={cn("relative", wrapperClassName)}>
    <Search
      className={cn(
        "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground",
        size === "lg" ? "size-4" : "size-3.5"
      )}
      aria-hidden
    />
    <input
      ref={ref}
      type="search"
      value={value}
      className={cn(
        "w-full rounded border border-input bg-card text-foreground shadow-xs transition-colors placeholder:text-muted-foreground/80 hover:border-foreground/20 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25",
        size === "lg" ? "h-11 pl-10 pr-10 text-[13.5px]" : "h-9 pl-9 pr-8 text-[12.5px]",
        "[&::-webkit-search-cancel-button]:appearance-none",
        className
      )}
      {...props}
    />
    {value && onClear && (
      <button
        type="button"
        onClick={onClear}
        aria-label="Clear search"
        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <X className="size-3.5" />
      </button>
    )}
  </div>
));
SearchInput.displayName = "SearchInput";
