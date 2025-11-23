"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TimePickerProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Parse current value or default to current time/00:00
  const [hours, minutes] = (value || "00:00").split(":").map(Number);

  const hoursList = Array.from({ length: 24 }, (_, i) => i);
  const minutesList = Array.from({ length: 60 }, (_, i) => i);

  const handleTimeChange = (type: "hour" | "minute", val: number) => {
    let newHours = hours;
    let newMinutes = minutes;

    if (type === "hour") newHours = val;
    if (type === "minute") newMinutes = val;

    const formattedTime = `${newHours.toString().padStart(2, "0")}:${newMinutes
      .toString()
      .padStart(2, "0")}`;

    onChange(formattedTime);
  };

  // Scroll to selected time on open
  const hoursRef = React.useRef<HTMLDivElement>(null);
  const minutesRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      const selectedHour = hoursRef.current?.querySelector(
        `[data-value="${hours}"]`
      );
      const selectedMinute = minutesRef.current?.querySelector(
        `[data-value="${minutes}"]`
      );

      if (selectedHour) {
        selectedHour.scrollIntoView({ block: "center" });
      }
      if (selectedMinute) {
        selectedMinute.scrollIntoView({ block: "center" });
      }
    }
  }, [isOpen, hours, minutes]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="neutralOutline"
          className={cn(
            "w-full justify-start text-left font-normal h-11 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 pl-3",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4 text-slate-400" />
          {value || "Pick a time"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex h-64 divide-x divide-slate-100 dark:divide-slate-800">
          {/* Hours Column */}
          <div className="flex flex-col w-20">
            <div className="p-2 text-xs font-medium text-center text-muted-foreground border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              Hours
            </div>
            <div
              ref={hoursRef}
              className="flex-1 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700"
            >
              <div className="flex flex-col gap-1">
                {hoursList.map((h) => (
                  <button
                    key={h}
                    data-value={h}
                    type="button"
                    onClick={() => handleTimeChange("hour", h)}
                    className={cn(
                      "w-full px-2 py-1.5 text-sm rounded-md transition-colors text-center",
                      hours === h
                        ? "bg-blue-600 text-white font-medium"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    {h.toString().padStart(2, "0")}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Minutes Column */}
          <div className="flex flex-col w-20">
            <div className="p-2 text-xs font-medium text-center text-muted-foreground border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              Mins
            </div>
            <div
              ref={minutesRef}
              className="flex-1 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700"
            >
              <div className="flex flex-col gap-1">
                {minutesList.map((m) => (
                  <button
                    key={m}
                    data-value={m}
                    type="button"
                    onClick={() => handleTimeChange("minute", m)}
                    className={cn(
                      "w-full px-2 py-1.5 text-sm rounded-md transition-colors text-center",
                      minutes === m
                        ? "bg-blue-600 text-white font-medium"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    {m.toString().padStart(2, "0")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
