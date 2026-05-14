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
        months: "flex flex-col space-y-0",
        month: "space-y-0",
        caption: "flex flex-col items-center pt-4 px-5 relative",
        caption_label: "text-[12px] font-bold text-slate-900 uppercase tracking-widest mt-1",
        nav: "flex items-center justify-between w-full absolute top-4 left-0 px-5",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-7 w-7 bg-transparent p-0 opacity-100 hover:text-primary transition-colors rounded-lg"
        ),
        nav_button_previous: "",
        nav_button_next: "",
        table: "w-full border-collapse mt-4",
        head_row: "flex px-3 border-b border-slate-50",
        head_cell: "text-slate-400 font-bold text-[10px] w-9 flex-1 py-3 text-center",
        row: "flex w-full mt-1 px-3 pb-3",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 flex-1",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md"
            : ""
        ),
        day: cn(
          "h-9 w-9 p-0 font-bold text-[11px] transition-all text-slate-600 hover:bg-primary/5 flex items-center justify-center rounded-lg"
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
