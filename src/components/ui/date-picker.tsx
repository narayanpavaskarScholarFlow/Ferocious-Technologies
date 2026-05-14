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
            "w-full justify-between text-left font-bold transition-all border-none h-12 px-4 bg-[#0a0f18] hover:bg-[#111827] rounded-xl text-white",
            !value && "text-white/40",
            open && "ring-2 ring-blue-600/50",
            className
          )}
        >
          <span className="truncate text-xs uppercase tracking-widest">
            {dateValue ? format(dateValue, "yyyy-MM-dd") : <span>{placeholder}</span>}
          </span>
          <div className={cn(
            "p-2 rounded-lg transition-colors ml-2",
            open ? "bg-blue-600 text-white" : "bg-white/10 text-white/60"
          )}>
            <CalendarIcon className="h-4 w-4" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] rounded-[2rem] overflow-hidden animate-in zoom-in-95" align="start" sideOffset={8}>
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleSelect}
          onClear={value ? handleClear : undefined}
          onToday={handleToday}
          initialFocus
          weekStartsOn={1}
          className="bg-white"
        />
      </PopoverContent>
    </Popover>
  )
}
