"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, Circle } from "lucide-react"
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
      className={cn("p-4 bg-white", className)}
      classNames={{
        months: "flex flex-col space-y-4",
        month: "space-y-4",
        caption: "flex items-center justify-between pt-1 relative px-1",
        caption_label: "text-sm font-medium text-slate-900 flex items-center gap-1",
        nav: "flex items-center gap-1",
        nav_button: cn(
          "h-7 w-7 bg-slate-100 border border-slate-300 flex items-center justify-center rounded-sm hover:bg-slate-200 transition-colors text-slate-600 shadow-sm"
        ),
        nav_button_previous: "",
        nav_button_next: "",
        table: "w-full border-collapse border border-[#3b82f6]/30",
        head_row: "flex bg-white",
        head_cell: "text-slate-900 font-normal text-[11px] w-9 h-8 flex items-center justify-center border-b border-[#3b82f6]/20",
        row: "flex w-full",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 flex-1 h-9 w-9",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md"
            : ""
        ),
        day: cn(
          "h-full w-full p-0 font-normal text-[12px] text-slate-900 flex items-center justify-center hover:bg-slate-100 transition-all"
        ),
        day_range_start: "day-range-start bg-blue-600 text-white",
        day_range_end: "day-range-end bg-blue-600 text-white",
        day_selected: "border-2 border-slate-400 bg-white !text-slate-900 !opacity-100",
        day_today: "font-bold text-blue-600",
        day_outside: "day-outside text-slate-300 opacity-50",
        day_disabled: "text-slate-300 opacity-50",
        day_range_middle: "aria-selected:bg-slate-50",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-3 w-3" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-3 w-3" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
