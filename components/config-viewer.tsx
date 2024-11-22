"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { ConfigValueViewer } from "./config/config-value-viewer";

interface ConfigViewerProps {
  config?: Record<string, any>;
}

export function ConfigViewer({ config }: ConfigViewerProps) {
  if (!config) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        No configuration available
      </div>
    );
  }

  return (
    <ScrollArea className="h-full rounded-md border">
      <div className="p-6 space-y-6">
        {Object.entries(config).map(([key, value]) => (
          <div key={key}>
            <h3 className="text-lg font-semibold mb-2">{key}</h3>
            <Card className="p-4">
              <ConfigValueViewer value={value} />
            </Card>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}