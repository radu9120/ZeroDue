"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export const CalendarPicker = ({
  date,
  onSelect,
}: {
  date?: Date;
  onSelect: (date: Date) => void;
}) => {
  const [viewDate, setViewDate] = useState(date || new Date());

  const today = new Date();
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Create calendar grid
  const calendarDays = [];

  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      isToday: false,
      date: new Date(year, month - 1, daysInPrevMonth - i),
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dayDate = new Date(year, month, day);
    calendarDays.push({
      day,
      isCurrentMonth: true,
      isToday: dayDate.toDateString() === today.toDateString(),
      isSelected: date && dayDate.toDateString() === date.toDateString(),
      date: dayDate,
    });
  }

  // Next month days to fill grid
  const remainingDays = 42 - calendarDays.length;
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: false,
      isToday: false,
      date: new Date(year, month + 1, day),
    });
  }

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg p-3 sm:p-4 w-full max-w-sm sm:w-80">
      <div className="flex items-center justify-between mb-3 sm:mb-4 pb-2 border-b border-gray-100 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="p-2 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-full transition-colors duration-200 text-blue-600 dark:text-blue-300"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div className="text-lg font-semibold text-gray-800 dark:text-slate-100">
          {months[month]} {year}
        </div>
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="p-2 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-full transition-colors duration-200 text-blue-600 dark:text-blue-300"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-3">
        {weekDays.map((day, index) => (
          <div
            key={`${day}-${index}`}
            className="text-center text-sm font-semibold text-gray-500 dark:text-slate-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((calDay, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(calDay.date)}
            className={cn(
              "h-10 w-10 text-sm rounded-lg font-medium transition-all duration-200 flex items-center justify-center text-gray-700 dark:text-slate-200",
              "hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-700 dark:hover:text-blue-400",
              !calDay.isCurrentMonth &&
                "text-gray-300 dark:text-slate-600 hover:text-gray-400 dark:hover:text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-800",
              calDay.isToday &&
                "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold ring-2 ring-blue-200 dark:ring-blue-700",
              calDay.isSelected &&
                "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
            )}
          >
            {calDay.day}
          </button>
        ))}
      </div>
    </div>
  );
};
