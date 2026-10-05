import Link from "next/link";
import { cn } from "@/lib/utils";

/** Section-sign mark + wordmark. `tone="inverse"` for the navy sidebar. */
export function Logo({ href = "/", tone = "default", className }: { href?: string; tone?: "default" | "inverse"; className?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2 font-heading text-lg font-semibold tracking-tight", className)}>
      <span
        aria-hidden
        className={cn(
          "grid size-7 place-items-center rounded-md font-serif text-base leading-none",
          tone === "inverse" ? "bg-brass text-sidebar" : "bg-primary text-primary-foreground",
        )}
      >
        §
      </span>
      <span>ClauseCheck</span>
    </Link>
  );
}
