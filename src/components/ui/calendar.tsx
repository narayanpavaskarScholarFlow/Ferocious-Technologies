"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

/**
 * High-Fidelity Industrial Calendar
 * Features Month/Year filters and precision-aligned day headers.
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-0 bg-white", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-0",
        month: "space-y-0",
        caption: "flex justify-between items-center py-4 px-4 relative",
        caption_label: "hidden", // Hidden because we use dropdowns
        caption_dropdowns: "flex gap-2 items-center flex-1 justify-center",
        dropdown: "bg-slate-50 border border-slate-200 rounded-md text-[11px] font-bold text-[#003366] px-2 py-1 focus:ring-2 focus:ring-primary/20 outline-none h-8 cursor-pointer uppercase tracking-tighter",
        nav: "absolute inset-x-4 flex justify-between items-center pointer-events-none z-10",
        nav_button: cn(
          "h-8 w-8 bg-white border border-slate-100 p-0 shadow-sm opacity-100 hover:bg-slate-50 transition-all text-primary pointer-events-auto cursor-pointer rounded-lg flex items-center justify-center"
        ),
        nav_button_previous: "",
        nav_button_next: "",
        table: "w-full border-collapse",
        head_row: "flex border-b border-slate-100 py-1.5",
        head_cell: "text-slate-400 w-10 font-bold text-[9px] uppercase text-center flex-1 tracking-widest",
        row: "flex w-full mt-1",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 flex-1",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md"
            : ""
        ),
        day: cn(
          "h-10 w-10 p-0 font-bold text-xs transition-all text-primary hover:bg-primary/5 flex items-center justify-center rounded-lg"
        ),
        day_range_start: "day-range-start bg-primary text-primary-foreground rounded-none rounded-l-lg",
        day_range_end: "day-range-end bg-primary text-primary-foreground rounded-none rounded-r-lg",
        day_selected: "bg-primary text-white !rounded-lg !opacity-100 hover:bg-primary hover:text-white shadow-lg shadow-primary/20",
        day_today: "text-primary ring-2 ring-primary/20 font-black",
        day_outside: "day-outside text-slate-200 opacity-50 aria-selected:bg-slate-100/50 aria-selected:text-slate-500 aria-selected:opacity-30",
        day_disabled: "text-slate-400 opacity-50",
        day_range_middle: "aria-selected:bg-slate-50 aria-selected:text-slate-900",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
