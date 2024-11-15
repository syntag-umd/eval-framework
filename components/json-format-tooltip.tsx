"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

const sampleFormat = {
  conversation1: {
    input: [
      {
        role: "system",
        content: "Initial system message",
      },
      {
        role: "user",
        content: "User message",
      },
    ],
    output: {
      message: "Assistant response",
      tool_calls: [],
    },
    config: {
      shop_name: "Cali's Finest Barberlounge",
      shop_address: "123 Barber Lane, Hairtown",
      shop_schedule: "Mon-Fri: 9am-6pm, Sat: 8am-6pm, Sun: 7am-3pm",
      barbers: [
        {
          name: "John",
          services: ["Haircut", "Shave", "Trim"],
        },
        {
          name: "Mike",
          services: ["Haircut", "Beard Styling"],
        },
        {
          name: "Sarah",
          services: ["Haircut", "Coloring", "Styling"],
        },
      ],
      services: {
        Haircut: ["John", "Mike", "Sarah"],
        Shave: ["John"],
        Trim: ["John"],
        Beard_Styling: ["Mike"],
        Coloring: ["Sarah"],
        Styling: ["Sarah"],
      },
      hardcoded_datetime: "2024-11-11T15:45:00",
    },
  },
};

export function JsonFormatTooltip() {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <button className="inline-flex items-center text-muted-foreground hover:text-foreground">
            <HelpCircle className="h-4 w-4" />
            <span className="ml-1 text-sm">JSON Format</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="w-[750px] p-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Expected JSON Format:</p>
            <pre className="text-xs bg-muted p-2 rounded overflow-x-auto whitespace-pre-wrap text-left">
              {JSON.stringify(sampleFormat, null, 2)}
            </pre>
            <p className="text-xs text-muted-foreground mt-2">
              Each conversation should have an input array of messages and an
              output object containing the response message and any tool calls.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
