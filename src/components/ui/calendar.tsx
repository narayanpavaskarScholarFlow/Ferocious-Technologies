"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, useDayPicker, useNavigation } from "react-day-picker"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { buttonVariants, Button } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

/**
 * High-Fidelity Industrial Calendar
 * Matches the reference image with centered Today node and premium matrix styling.
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
        months: "flex flex-col space-y-0",
        month: "space-y-0",
        caption: "flex justify-between items-center py-4 px-5 relative border-b border-slate-100",
        caption_label: "text-[11px] font-bold text-slate-900 uppercase tracking-widest",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-white p-0 opacity-100 hover:bg-slate-50 border-slate-200 text-slate-500 rounded-lg"
        ),
        nav_button_previous: "",
        nav_button_next: "",
        table: "w-full border-collapse",
        head_row: "flex border-b border-slate-50 px-3",
        head_cell: "text-slate-400 w-9 font-bold text-[9px] uppercase text-center flex-1 py-3 tracking-tighter",
        row: "flex w-full mt-1 px-3 pb-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 flex-1",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md"
            : ""
        ),
        day: cn(
          "h-9 w-9 p-0 font-bold text-[10px] transition-all text-slate-600 hover:bg-primary/5 flex items-center justify-center rounded-lg"
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
        Footer: () => {
          const { onDayClick } = useDayPicker();
          const handleToday = () => {
            const today = new Date();
            // This manually triggers selection if in single mode
            if (props.mode === 'single' && props.onSelect) {
              (props.onSelect as any)(today);
            }
          };

          return (
            <div className="p-3 border-t border-slate-100 bg-slate-50/50">
              <Button 
                type="button"
                onClick={handleToday}
                className="w-full h-10 bg-primary hover:bg-[#002d4f] text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-primary/20 transition-all"
              >
                Today
              </Button>
            </div>
          );
        }
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
