"use client";
import clsx from "clsx";

type BoundedProps = {
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
};

export default function Bounded({
  as: Comp = "section",
  className,
  children,
  ...restProps
}: BoundedProps) {
  return (
    <Comp
      className={clsx(
        "min-h-screen bg-gradient-to-br from-blue-50 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 pt-16 sm:pt-20 pb-12",
        className
      )}
      {...restProps}
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-8">
        {children}
      </div>
    </Comp>
  );
}
