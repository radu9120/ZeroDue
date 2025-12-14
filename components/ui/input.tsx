import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground dark:placeholder:text-slate-400 selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-1 text-base text-slate-900 depth-input transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-transparent dark:text-white dark:border-slate-400",
        "focus-visible:border-blue-500 focus-visible:ring-blue-500/30 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

export { Input };
