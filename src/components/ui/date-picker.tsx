"use client"

import * as React from "react"
import { format, isValid } from "date-fns"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * High-Fidelity Industrial Date Picker
 * Matches the "Code Editor" visual architecture with MMM DD formatting.
 */
export function DatePicker({ value, onChange, placeholder = "Select Date", className, disabled }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const dateValue = React.useMemo(() => {
    if (!value) return undefined;
    const parsed = new Date(value);
    return isValid(parsed) ? parsed : undefined;
  }, [value]);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(format(date, "yyyy-MM-dd"));
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={cn("group cursor-pointer w-full max-w-[240px]", className)}>
          <div className={cn(
            "bg-[#1A1F2C] border border-white/5 rounded-lg px-3 py-2.5 flex items-center justify-between shadow-xl transition-all hover:border-primary/30",
            disabled && "opacity-50 cursor-not-allowed"
          )}>
            <div className="flex items-center gap-2">
              <span className="text-primary/40 font-code text-xs font-bold">//</span>
              <span className={cn(
                "font-code text-xs tracking-tight font-bold",
                dateValue ? "text-primary" : "text-slate-500"
              )}>
                {dateValue ? format(dateValue, "MMM dd, yyyy") : placeholder}
              </span>
            </div>
            <div className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
            </div>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0 border border-slate-200 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] rounded-xl overflow-hidden bg-white animate-in zoom-in-95 duration-200" align="start" sideOffset={8}>
        <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <h4 className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">Temporal Selection Hub</h4>
          <Badge variant="outline" className="text-[8px] border-primary/20 text-primary bg-primary/5 px-2">v2.4_SYNC</Badge>
        </div>
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleSelect}
          initialFocus
          captionLayout="dropdown-buttons"
          fromYear={2020}
          toYear={2030}
          className="p-3"
        />
      </PopoverContent>
    </Popover>
  )
}

function Badge({ className, variant, ...props }: any) {
  return (
    <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", className)} {...props} />
  )
}
