"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ToolCallEditor } from './tool-call-editor';

interface ToolCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (toolCall: any) => void;
  initialToolCall?: any;
}

export function ToolCallModal({
  isOpen,
  onClose,
  onSave,
  initialToolCall
}: ToolCallModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configure Tool Call</DialogTitle>
        </DialogHeader>
        <ToolCallEditor
          toolCall={initialToolCall || { function: { name: '', arguments: {} } }}
          onSave={(toolCall) => {
            onSave(toolCall);
            onClose();
          }}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}