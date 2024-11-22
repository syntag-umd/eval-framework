"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

interface PromptViewerProps {
  prompt: string;
}

export function PromptViewer({ prompt }: PromptViewerProps) {
  if (!prompt) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        No prompt available
      </div>
    );
  }

  return (
    <ScrollArea className="h-full rounded-md border">
      <Card className="p-6">
        <pre className="whitespace-pre-wrap font-mono text-sm">{prompt}</pre>
      </Card>
    </ScrollArea>
  );
}