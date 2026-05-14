"use client"

import * as React from "react"
import { format, isValid } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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

export function DatePicker({ value, onChange, placeholder = "mm-dd-yyyy", className, disabled }: DatePickerProps) {
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
        <div className={cn("group cursor-pointer w-fit", className)}>
          <div className="bg-[#2D2D2D] rounded-sm px-2 py-1 flex items-center gap-1 shadow-sm">
            <span className="text-slate-400 font-mono text-sm">//</span>
            <span className={cn(
              "font-mono text-sm tracking-tight",
              value ? "bg-[#BBDDFF] text-[#2D2D2D] px-0.5" : "text-slate-500"
            )}>
              {dateValue ? format(dateValue, "MM-dd-yyyy") : placeholder}
            </span>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0 border border-slate-200 shadow-xl rounded-md overflow-hidden bg-white animate-in zoom-in-95" align="start" sideOffset={12}>
        <div className="bg-[#F0F2F5] px-4 py-3 border-b border-slate-200 relative">
          {/* Arrow */}
          <div className="absolute -top-1.5 left-6 w-3 h-3 bg-[#F0F2F5] rotate-45 border-t border-l border-slate-200" />
          <h4 className="text-[14px] font-medium text-slate-600">Select a date.</h4>
        </div>
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleSelect}
          initialFocus
          weekStartsOn={0}
          className="bg-white"
        />
      </PopoverContent>
    </Popover>
  )
}
