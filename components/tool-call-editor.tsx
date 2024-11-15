"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TOOLS } from '@/lib/evaluation';
import { Card } from '@/components/ui/card';
import { Save, X } from 'lucide-react';

interface ToolCallEditorProps {
  toolCall: any;
  onSave: (updatedToolCall: any) => void;
  onCancel: () => void;
}

export function ToolCallEditor({ toolCall, onSave, onCancel }: ToolCallEditorProps) {
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [arguments_, setArguments] = useState<{ [key: string]: any }>({});

  const getToolParameters = (toolName: string) => {
    const tool = TOOLS.find(t => t.function.name === toolName);
    return tool?.function.parameters?.properties || {};
  };

  useEffect(() => {
    const toolName = toolCall.function?.name || toolCall.name;
    setSelectedTool(toolName);

    let args = toolCall.function?.arguments || toolCall.arguments;
    if (typeof args === 'string') {
      try {
        args = JSON.parse(args);
      } catch (e) {
        console.error('Failed to parse arguments:', e);
        args = {};
      }
    }
    setArguments(args || {});
  }, [toolCall]);

  const handleToolChange = (newTool: string) => {
    setSelectedTool(newTool);
    setArguments({});
  };

  const handleSave = () => {
    const updatedToolCall = {
      id: toolCall.id,
      type: 'function',
      function: {
        name: selectedTool,
        arguments: JSON.stringify(arguments_) // Convert arguments to string
      }
    };
    onSave(updatedToolCall);
  };

  const parameters = getToolParameters(selectedTool);

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <Label>Tool</Label>
        <Select
          value={selectedTool}
          onValueChange={handleToolChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select tool" />
          </SelectTrigger>
          <SelectContent>
            {TOOLS.map((tool) => (
              <SelectItem key={tool.function.name} value={tool.function.name}>
                {tool.function.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {Object.entries(parameters).map(([key, schema]: [string, any]) => (
          <div key={key} className="space-y-2">
            <Label>
              {key}
              {schema.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              value={arguments_[key] || ''}
              onChange={(e) => setArguments(prev => ({
                ...prev,
                [key]: e.target.value
              }))}
              placeholder={schema.description || key}
            />
            {schema.description && (
              <p className="text-xs text-muted-foreground">{schema.description}</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
        >
          <X className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
        >
          <Save className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}