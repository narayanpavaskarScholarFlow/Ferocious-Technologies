"use client"

import * as React from "react"
import { format, isValid, parseISO } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

interface DatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Standard Modern Date Picker
 * High-fidelity UI with dark theme support and precision layout.
 */
export function DatePicker({ value, onChange, placeholder = "Select a date", className, disabled }: DatePickerProps) {
  const dateValue = React.useMemo(() => {
    if (!value) return undefined;
    const parsed = parseISO(value);
    return isValid(parsed) ? parsed : undefined;
  }, [value]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          disabled={disabled}
          className={cn(
            "w-full justify-between text-left font-normal h-12 px-4 bg-slate-50 border-slate-200 rounded-2xl hover:bg-slate-100 transition-all",
            !dateValue && "text-muted-foreground",
            className
          )}
        >
          <span className="font-bold text-xs uppercase tracking-widest">
            {dateValue ? format(dateValue, "PPP") : placeholder}
          </span>
          <CalendarIcon className="h-4 w-4 text-slate-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-none shadow-2xl rounded-2xl" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={(date) => {
            if (date) {
              onChange(format(date, "yyyy-MM-dd"));
            }
          }}
          initialFocus
          className="bg-white rounded-2xl"
        />
      </PopoverContent>
    </Popover>
  )
}
