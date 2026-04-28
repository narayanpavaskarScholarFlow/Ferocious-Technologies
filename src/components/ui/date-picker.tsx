"use client"

import * as React from "react"
import { format, parseISO, isValid } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

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

  const handleClear = () => {
    onChange("");
    setOpen(false);
  };

  const handleToday = () => {
    onChange(format(new Date(), "yyyy-MM-dd"));
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant={"outline"}
          className={cn(
            "w-full justify-between text-left font-bold transition-all border-slate-200 h-10 px-3 bg-white hover:bg-slate-50 rounded-xl",
            !value && "text-slate-400 font-medium",
            open && "ring-2 ring-blue-600/20 border-blue-600/50",
            className
          )}
        >
          <span className="truncate">
            {dateValue ? format(dateValue, "yyyy-MM-dd") : <span>{placeholder}</span>}
          </span>
          <div className={cn(
            "p-1.5 rounded-lg transition-colors ml-2",
            open ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500"
          )}>
            <CalendarIcon className="h-3.5 w-3.5" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[1.5rem] overflow-hidden animate-in zoom-in-95" align="start" sideOffset={8}>
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleSelect}
          onClear={value ? handleClear : undefined}
          onToday={handleToday}
          initialFocus
          captionLayout="dropdown-buttons"
          fromYear={2020}
          toYear={2035}
        />
      </PopoverContent>
    </Popover>
  )
}
