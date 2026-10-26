import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-lg border border-[#C3C6D4] bg-white px-3.5 py-3 text-[15px] text-slate-900 outline-none transition placeholder:text-[#6B7280] focus:border-[#0040A1] focus:ring-2 focus:ring-[#0040A1]/10",
        className,
      )}
      {...props}
    />
  );
}