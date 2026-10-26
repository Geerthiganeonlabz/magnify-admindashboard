import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[#C3C6D4] bg-white px-3 py-1 text-xs font-medium text-[#434652]",
        className,
      )}
      {...props}
    />
  );
}