"use client"

import * as React from "react"
import { format, isValid } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

interface DatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * High-Fidelity Industrial Date Picker
 * Exactly matches the reference image with dark trigger and premium matrix popover.
 */
export function DatePicker({ value, onChange, placeholder = "Pick a date", className, disabled }: DatePickerProps) {
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
        <div className={cn("group cursor-pointer w-full", className)}>
          <div className={cn(
            "bg-[#0a0f18] border border-white/5 rounded-xl px-4 py-3 flex items-center justify-between shadow-2xl transition-all hover:border-primary/40",
            disabled && "opacity-50 cursor-not-allowed"
          )}>
            <span className={cn(
              "font-bold text-[11px] tracking-tight uppercase",
              dateValue ? "text-white" : "text-slate-500"
            )}>
              {dateValue ? format(dateValue, "MMM dd, yyyy") : placeholder}
            </span>
            <div className="h-7 w-7 rounded-lg bg-white/10 flex items-center justify-center border border-white/5 shadow-inner">
              <CalendarIcon className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 border-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] rounded-[1.5rem] overflow-hidden bg-white animate-in zoom-in-95 duration-200" align="start" sideOffset={12}>
        <div className="bg-slate-900 px-5 py-3 border-b border-white/5 flex items-center justify-between">
          <div className="flex flex-col">
            <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Temporal Matrix</h4>
            <p className="text-[7px] text-white/40 uppercase font-bold tracking-widest">Protocol v2.4_SYNC</p>
          </div>
          <Badge className="bg-primary/20 text-primary border-none text-[8px] font-bold px-2 py-0">ACTIVE_NODE</Badge>
        </div>
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleSelect}
          initialFocus
          className="p-0"
        />
      </PopoverContent>
    </Popover>
  )
}
