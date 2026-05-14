"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

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
        caption: "flex justify-center pt-1 relative items-center mb-6",
        caption_label: "text-[11px] font-bold text-slate-900 uppercase tracking-[0.2em]",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-7 w-7 bg-transparent p-0 opacity-40 hover:opacity-100 transition-all hover:bg-slate-100 rounded-lg"
        ),
        nav_button_previous: "absolute left-2",
        nav_button_next: "absolute right-2",
        table: "w-full border-collapse",
        head_row: "flex mb-4 justify-between",
        head_cell: "text-slate-400 rounded-md w-9 font-bold text-[9px] uppercase text-center tracking-widest",
        row: "flex w-full mt-2 justify-between",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-transparent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-bold text-[10px] aria-selected:opacity-100 hover:bg-slate-50 rounded-xl transition-all text-slate-600"
        ),
        day_range_start: "day-range-start bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-xl",
        day_range_end: "day-range-end bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-xl",
        day_selected: "bg-blue-600 text-white !rounded-xl shadow-lg shadow-blue-600/20 !opacity-100 hover:bg-blue-700 hover:text-white border-none",
        day_today: "text-blue-600 font-black relative after:absolute after:bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-blue-600 after:rounded-full",
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
      footer={
        <div className="flex flex-col gap-2 pt-6 mt-4 border-t border-slate-100">
          <Button 
            type="button"
            onClick={onToday}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-blue-600/20 transition-all active:scale-95"
          >
            Today
          </Button>
          {onClear && (
            <button 
              type="button"
              onClick={onClear}
              className="text-[9px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-[0.2em] transition-colors py-2"
            >
              Clear Matrix Selection
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
