"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ConfigValueViewer } from "./config-value-viewer";

interface ArrayViewerProps {
  value: any[];
  isNested?: boolean;
}

export function ArrayViewer({ value, isNested = false }: ArrayViewerProps) {
  // If array contains primitive values, show as badges
  if (value.every(item => 
    typeof item === 'string' || 
    typeof item === 'number' || 
    typeof item === 'boolean'
  )) {
    return (
      <div className="flex flex-wrap gap-2">
        {value.map((item, index) => (
          <Badge key={index} variant="secondary">
            {String(item)}
          </Badge>
        ))}
      </div>
    );
  }

  // If array contains objects, show as cards
  return (
    <div className="space-y-2">
      {value.map((item, index) => (
        <Card key={index} className={isNested ? "p-2" : "p-4"}>
          <ConfigValueViewer value={item} />
        </Card>
      ))}
    </div>
  );
}