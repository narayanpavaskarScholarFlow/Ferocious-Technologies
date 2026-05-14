"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

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
        caption_label: "text-[16px] font-bold text-[#003366] text-center w-full",
        nav: "absolute inset-x-4 flex justify-between items-center pointer-events-none",
        nav_button: cn(
          "h-7 w-7 bg-transparent p-0 opacity-100 hover:opacity-80 transition-all text-blue-600 pointer-events-auto cursor-pointer"
        ),
        nav_button_previous: "",
        nav_button_next: "",
        table: "w-full border-collapse",
        head_row: "flex border-b border-slate-100 py-1",
        head_cell: "text-slate-400 w-10 font-bold text-[10px] uppercase text-center flex-1",
        row: "flex w-full",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 flex-1",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md"
            : ""
        ),
        day: cn(
          "h-10 w-10 p-0 font-bold text-sm transition-all text-blue-600 hover:bg-slate-50 flex items-center justify-center rounded-none"
        ),
        day_range_start: "day-range-start bg-primary text-primary-foreground",
        day_range_end: "day-range-end bg-primary text-primary-foreground",
        day_selected: "bg-[#0055CC] text-white !rounded-sm !opacity-100 hover:bg-[#0055CC] hover:text-white",
        day_today: "text-[#0055CC] font-black",
        day_outside: "day-outside text-slate-200 opacity-50 aria-selected:bg-slate-100/50 aria-selected:text-slate-500 aria-selected:opacity-30",
        day_disabled: "text-slate-400 opacity-50",
        day_range_middle: "aria-selected:bg-slate-50 aria-selected:text-slate-900",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-5 w-5" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-5 w-5" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
