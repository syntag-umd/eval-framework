"use client";

import { useState, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSettings } from '@/lib/settings';
import { ToolEditor } from './tool-editor';
import { Plus, RotateCcw, Download, Upload } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function SettingsPage() {
  const { apiKey, tools, setApiKey, setTools, resetTools } = useSettings();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveApiKey = () => {
    setApiKey(localApiKey);
  };

  const handleAddTool = () => {
    setTools([
      ...tools,
      {
        type: 'function',
        function: {
          name: 'new_tool',
          description: 'Description of the new tool',
          parameters: {
            type: 'object',
            properties: {},
            required: [],
            additionalProperties: false,
          },
        },
      },
    ]);
  };

  const handleUpdateTool = (index: number, updatedTool: any) => {
    const newTools = [...tools];
    newTools[index] = updatedTool;
    setTools(newTools);
  };

  const handleDeleteTool = (index: number) => {
    const newTools = tools.filter((_, i) => i !== index);
    setTools(newTools);
  };

  const handleExportTools = () => {
    const blob = new Blob([JSON.stringify(tools, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tools-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportTools = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedTools = JSON.parse(content);
        
        // Basic validation
        if (!Array.isArray(importedTools)) {
          throw new Error('Invalid format: Tools configuration must be an array');
        }

        // Validate each tool
        importedTools.forEach((tool, index) => {
          if (!tool.type || tool.type !== 'function' || !tool.function?.name || !tool.function?.parameters) {
            throw new Error(`Invalid tool at index ${index}: Missing required properties`);
          }
        });

        setTools(importedTools);
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse tools configuration');
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-8">
        {/* API Key Section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">OpenAI API Key</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="api-key"
                  type="password"
                  value={localApiKey}
                  onChange={(e) => setLocalApiKey(e.target.value)}
                  placeholder="sk-..."
                />
                <Button onClick={handleSaveApiKey}>Save</Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Tools Section */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Available Tools</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowResetConfirm(true)}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Default
              </Button>
              <Button variant="outline" onClick={handleExportTools}>
                <Download className="h-4 w-4 mr-2" />
                Export Tools
              </Button>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Import Tools
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportTools}
                className="hidden"
              />
              <Button onClick={handleAddTool}>
                <Plus className="h-4 w-4 mr-2" />
                Add Tool
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {tools.map((tool, index) => (
              <ToolEditor
                key={index}
                tool={tool}
                onUpdate={(updatedTool) => handleUpdateTool(index, updatedTool)}
                onDelete={() => handleDeleteTool(index)}
              />
            ))}
          </div>
        </Card>
      </div>

      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Tools to Default?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All custom tools will be lost and replaced with the default set.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              resetTools();
              setShowResetConfirm(false);
            }}>
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}