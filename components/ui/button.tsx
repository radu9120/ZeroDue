"use client";
import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive depth-button",
  {
    variants: {
      variant: {
        primary:
          "bg-blue-600 hover:bg-blue-500 text-white border-0 hover:shadow-md active:shadow-sm",
        secondary:
          "w-full flex-1 border-slate-200 border bg-white shadow-xs hover:bg-slate-50 hover:text-slate-900 dark:bg-slate-800/90 dark:border-slate-700/60 dark:hover:bg-slate-700 dark:text-slate-200",
        link: "text-primary underline-offset-4 hover:underline shadow-none",
        ghost:
          "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 shadow-none",
        neutral:
          "bg-slate-900 text-white hover:bg-slate-700 border border-slate-900 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 dark:border-white",
        neutralOutline:
          "border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800 dark:bg-slate-800/50",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
