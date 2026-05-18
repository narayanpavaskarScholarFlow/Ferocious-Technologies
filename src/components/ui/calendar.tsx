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
      weekStartsOn={0}
      formatters={{
        formatWeekdayName: (date) => {
          const days = ["SU", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
          return days[date.getDay()];
        }
      }}
      className={cn("p-3 bg-white rounded-2xl shadow-xl", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-2",
        month_caption: "flex justify-center pt-1 relative items-center mb-0",
        caption_label: "text-sm font-bold text-[#001F3D] uppercase tracking-widest",
        nav: "absolute left-0 flex items-center gap-1 pl-1",
        button_previous: cn(
          buttonVariants({ variant: "ghost" }),
          "h-7 w-7 bg-transparent p-0 text-[#001F3D] hover:bg-slate-100 rounded-lg opacity-50 hover:opacity-100"
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost" }),
          "h-7 w-7 bg-transparent p-0 text-[#001F3D] hover:bg-slate-100 rounded-lg opacity-50 hover:opacity-100"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex border-b border-slate-50 pb-0",
        weekday: "text-[#001F3D]/40 w-6 font-bold text-[10px] uppercase text-center tracking-tighter",
        week: "flex w-full mt-0",
        day: "p-0",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-6 w-6 p-0 font-bold text-[11px] aria-selected:opacity-100 hover:bg-blue-50 text-[#001F3D] rounded-lg transition-all"
        ),
        selected: "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-600 focus:text-white shadow-md shadow-blue-600/20",
        today: "border-2 border-blue-600/30 text-blue-600 font-black",
        outside: "text-slate-200 opacity-30",
        disabled: "text-slate-200 opacity-20",
        range_middle: "aria-selected:bg-blue-50 aria-selected:text-blue-600",
        hidden: "invisible",
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
