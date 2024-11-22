"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { Card } from '@/components/ui/card';
import { Save, X } from 'lucide-react';
import { useSettings } from '@/lib/settings';

interface ToolCallEditorProps {
  toolCall: any;
  onSave: (updatedToolCall: any) => void;
  onCancel: () => void;
  inline?: boolean;
}

export function ToolCallEditor({ toolCall, onSave, onCancel, inline = false }: ToolCallEditorProps) {
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [arguments_, setArguments] = useState<{ [key: string]: any }>({});
  const argumentRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const { tools } = useSettings();

  // Function to get parameters of the selected tool
  const getToolParameters = useCallback((toolName: string) => {
    const tool = tools.find(t => t.function.name === toolName);
    return tool?.function.parameters?.properties || {};
  }, [tools]);

  // Initialize state based on toolCall prop
  useEffect(() => {
    const toolName = toolCall.function?.name || toolCall.name;
    if (toolName) {
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
    }
  }, [toolCall]);

  // Handle tool selection change
  const handleToolChange = useCallback((newTool: string) => {
    setSelectedTool(newTool);
    setArguments({});
  }, []);

  // Handle individual argument changes
  const handleArgumentChange = useCallback((key: string, value: string) => {
    setArguments(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Handle save action
  const handleSave = useCallback(() => {
    const updatedToolCall = {
      id: toolCall.id || `call_${Math.random().toString(36).substr(2, 9)}`,
      type: 'function',
      function: {
        name: selectedTool,
        arguments: JSON.stringify(arguments_)
      }
    };
    onSave(updatedToolCall);
  }, [selectedTool, arguments_, onSave, toolCall.id]);

  const parameters = getToolParameters(selectedTool);

  return (
    <Card className={inline ? "" : "p-4"}>
      <div className="space-y-4">
        {/* Tool Selection */}
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
              {tools.map((tool) => (
                <SelectItem key={tool.function.name} value={tool.function.name}>
                  {tool.function.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Argument Inputs */}
        <div className="space-y-4">
          {Object.entries(parameters).map(([key, schema]: [string, any]) => (
            <div key={key} className="space-y-2">
              <Label>
                {key}
                {schema.required && <span className="text-red-500">*</span>}
              </Label>
              <Input
                ref={(el: HTMLInputElement | null) => { argumentRefs.current[key] = el; }}
                type="text"
                value={arguments_[key] || ''}
                onChange={(e) => handleArgumentChange(key, e.target.value)}
                placeholder={schema.description || key}
              />

              {schema.description && (
                <p className="text-xs text-muted-foreground">{schema.description}</p>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
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
      </div>
    </Card>
  );
}