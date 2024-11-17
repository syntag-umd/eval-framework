"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (isToolResponse: boolean, toolCallId?: string) => void;
  isLoading: boolean;
  toolCallIds: string[];
  awaitingToolResponse: string | null;
  pendingToolCalls: Set<string>;
}

export function MessageInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  toolCallIds,
  awaitingToolResponse,
  pendingToolCalls
}: MessageInputProps) {
  const [isToolResponse, setIsToolResponse] = useState(false);
  const [selectedToolCallId, setSelectedToolCallId] = useState<string>('');

  // Update isToolResponse based on pending tool calls
  useEffect(() => {
    if (pendingToolCalls.size > 0) {
      setIsToolResponse(true);
      if (!selectedToolCallId || !pendingToolCalls.has(selectedToolCallId)) {
        setSelectedToolCallId(Array.from(pendingToolCalls)[0]);
      }
    }
  }, [pendingToolCalls, selectedToolCallId]);

  const handleSubmit = () => {
    if (isToolResponse) {
      onSubmit(true, selectedToolCallId || awaitingToolResponse || undefined);
    } else {
      if (pendingToolCalls.size > 0) {
        return; // Don't allow non-tool responses when there are pending tool calls
      }
      onSubmit(false);
    }
  };

  return (
    <div className="space-y-2">
      {pendingToolCalls.size > 0 && !isToolResponse && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            There are pending tool calls that need to be responded to first.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch
            checked={isToolResponse}
            onCheckedChange={setIsToolResponse}
            id="tool-response"
            disabled={pendingToolCalls.size > 0}
          />
          <Label htmlFor="tool-response">Tool Response</Label>
        </div>
        
        {isToolResponse && toolCallIds.length > 0 && (
          <Select
            value={selectedToolCallId || awaitingToolResponse || ''}
            onValueChange={setSelectedToolCallId}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select tool call ID" />
            </SelectTrigger>
            <SelectContent>
              {toolCallIds.map((id) => (
                <SelectItem key={id} value={id}>
                  {id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex gap-2">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isToolResponse ? "Enter tool response..." : "Type your message..."}
          className="resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <Button onClick={handleSubmit} disabled={isLoading}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}