"use client"

import * as React from "react"
import { format, isValid } from "date-fns"
import { ChevronLeft, ChevronRight, Circle } from "lucide-react"

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
 * Classic Legacy Template Date Picker
 * Matches the requested "Input + Button" trigger and boxed calendar style.
 */
export function DatePicker({ value, onChange, placeholder = "Select a date", className, disabled }: DatePickerProps) {
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

  const onToday = () => {
    handleSelect(new Date());
  };

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex-1 relative">
        <input
          readOnly
          disabled={disabled}
          value={dateValue ? format(dateValue, "d/M/yyyy") : ""}
          placeholder={placeholder}
          className={cn(
            "w-full h-8 px-2 border border-slate-400 bg-white text-sm font-normal focus:outline-none shadow-inner",
            disabled && "bg-slate-50 cursor-not-allowed"
          )}
        />
      </div>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "h-8 px-3 bg-slate-200 border border-slate-400 text-sm font-medium hover:bg-slate-300 active:bg-slate-400 transition-colors shadow-sm",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            Date
          </button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0 border border-slate-300 shadow-xl rounded-sm overflow-hidden bg-white" 
          align="end" 
          sideOffset={5}
        >
          {/* Custom Header for the Popover to match reference nav buttons */}
          <Calendar
            mode="single"
            selected={dateValue}
            onSelect={handleSelect}
            initialFocus
            className="p-0"
            classNames={{
              caption: "flex items-center justify-between p-3 border-b border-slate-100",
              caption_label: "text-sm font-medium text-slate-900 capitalize",
              nav: "flex items-center gap-1",
            }}
            components={{
              IconLeft: () => <ChevronLeft className="h-3 w-3" />,
              IconRight: () => <ChevronRight className="h-3 w-3" />,
              // Adding the custom "Today/Dot" button in the navigation group
            }}
          />
          
          {/* Action Hub as the middle button in navigation is hard with standard DayPicker, 
              so we add it to the header area or footer as a floating-ish element if needed.
              For 1:1 parity with the nav icons in the image: */}
          <div className="absolute top-3 right-12 flex items-center pointer-events-none">
             <button 
               onClick={(e) => { e.stopPropagation(); onToday(); }}
               className="pointer-events-auto h-7 w-7 bg-slate-100 border border-slate-300 flex items-center justify-center rounded-sm hover:bg-slate-200 shadow-sm mx-1"
             >
               <Circle className="h-2 w-2 fill-slate-600 text-slate-600" />
             </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
