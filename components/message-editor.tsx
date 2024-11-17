"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Save, X } from "lucide-react";
import { ToolCallModal } from './tool-call-modal';

interface MessageEditorProps {
  content: string;
  isToolCall: boolean;
  toolCall?: any;
  onSave: (content: string, isToolCall: boolean, toolCall?: any) => void;
  onCancel: () => void;
}

export function MessageEditor({
  content,
  isToolCall,
  toolCall,
  onSave,
  onCancel
}: MessageEditorProps) {
  const [editContent, setEditContent] = useState(content);
  const [useToolCall, setUseToolCall] = useState(isToolCall);
  const [isToolCallModalOpen, setIsToolCallModalOpen] = useState(false);
  const [editingToolCall, setEditingToolCall] = useState(toolCall);

  const handleSave = () => {
    if (useToolCall) {
      setIsToolCallModalOpen(true);
    } else {
      onSave(editContent, false);
    }
  };

  const handleToolCallSave = (toolCall: any) => {
    setEditingToolCall(toolCall);
    onSave('', true, toolCall);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Switch
          checked={useToolCall}
          onCheckedChange={(checked) => {
            setUseToolCall(checked);
            if (checked) {
              setIsToolCallModalOpen(true);
            }
          }}
          id="use-tool-call"
        />
        <Label htmlFor="use-tool-call">Use Tool Call</Label>
      </div>

      {!useToolCall && (
        <Textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="min-h-[100px] bg-background"
        />
      )}

      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={onCancel}
        >
          <X className="h-4 w-4" />
        </Button>
        {!useToolCall && (
          <Button
            size="sm"
            onClick={handleSave}
          >
            <Save className="h-4 w-4" />
          </Button>
        )}
      </div>

      <ToolCallModal
        isOpen={isToolCallModalOpen}
        onClose={() => {
          setIsToolCallModalOpen(false);
          if (!editingToolCall) {
            setUseToolCall(false);
          }
        }}
        onSave={handleToolCallSave}
        initialToolCall={editingToolCall}
      />
    </div>
  );
}