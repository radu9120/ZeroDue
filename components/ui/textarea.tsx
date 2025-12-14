import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-muted-foreground dark:placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-blue-500/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 depth-input transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-transparent dark:text-white dark:border-slate-400",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
