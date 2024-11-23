"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TIMEZONES } from "@/utils/timezones";

interface TimezoneSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function TimezoneSelector({ value, onValueChange }: TimezoneSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[300px]">
        <SelectValue placeholder="Select timezone" />
      </SelectTrigger>
      <SelectContent>
        {TIMEZONES.map((timezone) => (
          <SelectItem key={timezone} value={timezone}>
            {timezone.replace(/_/g, ' ')}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}