"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  onClear?: () => void;
  onToday?: () => void;
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  onClear,
  onToday,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 bg-white", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-between pt-1 relative items-center px-2 mb-4",
        caption_label: "text-sm font-bold text-slate-900 uppercase tracking-tight",
        nav: "space-x-1 flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity border-slate-200 rounded-md"
        ),
        table: "w-full border-collapse space-y-1",
        head_row: "flex mb-2",
        head_cell: "text-slate-400 rounded-md w-9 font-bold text-[10px] uppercase text-center",
        row: "flex w-full mt-1",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-slate-50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-bold text-[11px] aria-selected:opacity-100 hover:bg-slate-100 rounded-md transition-all text-slate-600"
        ),
        day_range_start: "day-range-start bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
        day_range_end: "day-range-end bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
        day_selected: "bg-blue-600 text-white !rounded-md shadow-md !opacity-100 hover:bg-blue-700 hover:text-white border-none",
        day_today: "border-2 border-blue-600 text-blue-600 bg-white font-black rounded-md",
        day_outside: "day-outside text-slate-300 opacity-50 aria-selected:bg-slate-100/50 aria-selected:text-slate-500 aria-selected:opacity-30",
        day_disabled: "text-slate-400 opacity-50",
        day_range_middle: "aria-selected:bg-slate-100 aria-selected:text-slate-900",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      footer={
        <div className="flex flex-col gap-2 pt-4 mt-4 border-t border-slate-100 px-1">
          <Button 
            type="button"
            onClick={onToday}
            className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] uppercase tracking-[0.1em] rounded-md shadow-sm transition-all"
          >
            Today
          </Button>
          {onClear && (
            <button 
              type="button"
              onClick={onClear}
              className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-wider transition-colors py-1"
            >
              Clear Selection
            </button>
          )}
        </div>
      }
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
