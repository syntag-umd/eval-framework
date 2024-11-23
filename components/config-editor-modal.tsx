"use client";

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, X, Save, Download, Upload, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { usePromptStore } from "@/lib/stores/prompt-store";
import { buildSystemPrompt } from "@/lib/prompt-builder";
import { useTimezoneStore } from '@/lib/stores/timezone-store';
import { TimezoneSelector } from './timezone-selector';

interface ConfigEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: Record<string, any>) => void;
  initialConfig: Record<string, any>;
}

type ValueType = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date';

// Recursive ValueEditor Component
interface ValueEditorProps {
  keyPath: string[]; // Array of keys representing the path to the current value
  value: any;
  type: ValueType;
  onChange: (path: string[], newValue: any, newType?: ValueType) => void;
  onDelete?: (path: string[]) => void;
}

const ValueEditor: React.FC<ValueEditorProps> = ({ keyPath, value, type, onChange, onDelete }) => {
  // Determine if all items in the array are simple types
  const isArraySimple = (arr: any[]): boolean => {
    return arr.every(item => {
      const itemType = determineType(item);
      return ['string', 'number', 'boolean', 'date'].includes(itemType);
    });
  };

  // Initialize isSimpleView based on array content
  const [isSimpleView, setIsSimpleView] = useState<boolean>(
    type === 'array' ? isArraySimple(value) : false
  );

  const handlePrimitiveChange = (newValue: any, newType?: ValueType) => {
    onChange(keyPath, newValue, newType);
  };

  // State for new field/item type when adding to objects or arrays
  const [newFieldType, setNewFieldType] = useState<ValueType>('string');
  
  // **New State for New Field Name**
  const [newFieldName, setNewFieldName] = useState<string>('');
  const [fieldError, setFieldError] = useState<string>('');

  // Handler to add a new field in object
  const handleAddObjectField = () => {
    if (!newFieldName.trim()) {
      setFieldError('Field name cannot be empty.');
      return;
    }

    if (value && typeof value === 'object' && !Array.isArray(value) && newFieldName in value) {
      setFieldError('Field name already exists.');
      return;
    }

    const defaultValues: Record<ValueType, any> = {
      string: '',
      number: 0,
      boolean: false,
      array: [],
      object: {},
      date: new Date().toISOString()
    };
    onChange([...keyPath, newFieldName], defaultValues[newFieldType], newFieldType);
    setNewFieldName('');
    setFieldError('');
  };

  // Handler to add a new item in array
  const handleAddArrayItem = () => {
    const defaultValues: Record<ValueType, any> = {
      string: '',
      number: 0,
      boolean: false,
      array: [],
      object: {},
      date: new Date().toISOString()
    };
    onChange([...keyPath, String(value.length)], defaultValues[newFieldType], newFieldType);
  };

  const renderEditor = () => {
    switch (type) {
      case 'string':
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handlePrimitiveChange(e.target.value)}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handlePrimitiveChange(e.target.value !== '' ? Number(e.target.value) : '')}
          />
        );
      case 'boolean':
        return (
          <Switch
            checked={value}
            onCheckedChange={(checked) => handlePrimitiveChange(checked)}
          />
        );
      case 'date':
        return (
          <Input
            type="datetime-local"
            value={new Date(value).toISOString().slice(0, 16)}
            onChange={(e) => handlePrimitiveChange(e.target.value)}
          />
        );
      case 'object':
        return (
          <div className="pl-4 border-l">
            {value && typeof value === 'object' && !Array.isArray(value) ? (
              Object.entries(value).map(([key, val]) => {
                const valType: ValueType = determineType(val);
                return (
                  <div key={key} className="mb-4">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold">{key}</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete && onDelete([...keyPath, key])}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <ValueEditor
                      keyPath={[...keyPath, key]}
                      value={val}
                      type={valType}
                      onChange={onChange}
                      onDelete={onDelete}
                    />
                  </div>
                );
              })
            ) : (
              <div className="text-red-500">Invalid object format</div>
            )}
            {/* **New UI for Adding Fields with Editable Names** */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <Input
                  placeholder="New field name"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  className="min-w-[200px] flex-grow"
                />
                <Select
                  value={newFieldType}
                  onValueChange={(value) => setNewFieldType(value as ValueType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">String</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="array">Array</SelectItem>
                    <SelectItem value="object">Object</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddObjectField}
                  className="w-[100px] flex items-center justify-center"
                >
                  Add Field
                </Button>
              </div>
              {fieldError && (
                <div className="text-red-500 text-sm">{fieldError}</div>
              )}
            </div>
          </div>
        );
      case 'array':
        return (
          <div className="pl-4 border-l">
            {/* Toggle Switch for Simple/Detailed View */}
            <div className="flex items-center justify-between mb-2">
              <Label className="font-semibold">Array Options</Label>
              <div className="flex items-center space-x-2">
                <span className="text-sm">Simple View</span>
                <Switch
                  checked={isSimpleView}
                  onCheckedChange={() => setIsSimpleView(!isSimpleView)}
                />
              </div>
            </div>

            {isSimpleView ? (
              // Simple View: Display count and comma-separated values
              <div className="p-2 bg-gray-50 rounded">
                <div className="mb-2 text-sm text-gray-600">
                  {value.length} item{value.length !== 1 ? 's' : ''}
                </div>
                <div className="text-sm text-gray-800">
                  {value.join(', ')}
                </div>
              </div>
            ) : (
              // Detailed View: Existing detailed array editor
              <>
                {Array.isArray(value) ? (
                  value.map((item, index) => {
                    const itemType: ValueType = determineType(item);
                    return (
                      <div key={index} className="mb-4">
                        <div className="flex items-center justify-between">
                          <Label className="font-semibold">Item {index + 1}</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete && onDelete([...keyPath, String(index)])}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <ValueEditor
                          keyPath={[...keyPath, String(index)]}
                          value={item}
                          type={itemType}
                          onChange={onChange}
                          onDelete={onDelete}
                        />
                      </div>
                    );
                  })
                ) : (
                  <div className="text-red-500">Invalid array format</div>
                )}
                <div className="mt-4 flex items-center justify-center space-x-2">
                  <Select
                    value={newFieldType}
                    onValueChange={(value) => setNewFieldType(value as ValueType)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">String</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                      <SelectItem value="array">Array</SelectItem>
                      <SelectItem value="object">Object</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddArrayItem}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      {renderEditor()}
    </div>
  );
};

// Helper function to determine the ValueType based on the value
const determineType = (value: any): ValueType => {
  if (typeof value === 'string') {
    if (!isNaN(Date.parse(value))) return 'date';
    return 'string';
  }
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object' && value !== null) return 'object';
  return 'string';
};


// Main ConfigEditorModal Component
export function ConfigEditorModal({
  isOpen,
  onClose,
  onSave,
  initialConfig
}: ConfigEditorModalProps) {
  const [config, setConfig] = useState<Record<string, any>>(initialConfig);
  const [error, setError] = useState<string>('');
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<ValueType>('string');
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { systemPrompt } = usePromptStore();
  const { timezone, setTimezone } = useTimezoneStore();

  // Handler to update values based on key path
  const handleUpdateValue = (path: string[], newValue: any, newType?: ValueType) => {
    setConfig(prev => {
      const updated = { ...prev };
      let current: any = updated;
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (!(key in current)) {
          current[key] = {};
        }
        current = current[key];
      }
      const lastKey = path[path.length - 1];
      current[lastKey] = newValue;
      return updated;
    });
    setError('');
  };

  // Handler to delete a field based on key path
  const handleDeleteField = (path: string[]) => {
    setConfig(prev => {
      const updated = { ...prev };
      let current: any = updated;
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (!(key in current)) {
          return prev; // Path invalid
        }
        current = current[key];
      }
      const lastKey = path[path.length - 1];
      if (Array.isArray(current)) {
        current.splice(Number(lastKey), 1);
      } else {
        delete current[lastKey];
      }
      return updated;
    });
  };

  // **Updated Handler to Add Fields with Editable Names**
  const handleAddField = () => {
    if (!newFieldName.trim()) {
      setError('Field name cannot be empty');
      return;
    }
    if (config[newFieldName] !== undefined) {
      setError('Field name already exists');
      return;
    }

    const defaultValues: Record<ValueType, any> = {
      string: '',
      number: 0,
      boolean: false,
      array: [],
      object: {},
      date: new Date().toISOString()
    };

    setConfig(prev => ({
      ...prev,
      [newFieldName]: defaultValues[newFieldType]
    }));

    setNewFieldName('');
    setError('');
  };

  const handleExportConfig = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedConfig = JSON.parse(content);
        
        if (typeof importedConfig !== 'object' || importedConfig === null) {
          throw new Error('Invalid configuration format');
        }

        setConfig(importedConfig);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse configuration');
      }
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  const formattedPrompt = buildSystemPrompt(config, systemPrompt);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 border-b">
          <DialogTitle>Configuration Editor</DialogTitle>
          
          <div className="mt-4 grid grid-cols-3 items-center gap-4">
            {/* Left: Timezone Selector */}
            <div className="flex items-center gap-2">
              <Label>Timezone:</Label>
              <TimezoneSelector value={timezone} onValueChange={setTimezone} />
            </div>

            {/* Center: TabsList */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "editor" | "preview")}>
              <TabsList className="justify-self-center">
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="preview">Prompt Preview</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Right: Import/Export Buttons */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleExportConfig}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportConfig}
                className="hidden"
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4 col-span-3">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "editor" | "preview")} className="flex-1 flex flex-col min-h-0">
          <TabsContent value="editor" className="flex-1 min-h-0 p-6 overflow-y-auto">
            <div className="flex flex-col h-full">
              {/* Centered Add Field Section */}
              <div className="flex justify-center mb-6">
                <Card className="w-full max-w-3xl">
                  <div className="p-4 space-y-2">
                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-2">
                      <Input
                        placeholder="New field name"
                        value={newFieldName}
                        onChange={(e) => setNewFieldName(e.target.value)}
                        className="min-w-[200px] flex-grow"
                      />
                      <Select
                        value={newFieldType}
                        onValueChange={(value) => setNewFieldType(value as ValueType)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                          <SelectItem value="array">Array</SelectItem>
                          <SelectItem value="object">Object</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleAddField}
                        disabled={!newFieldName.trim()}
                        className="w-[100px] flex items-center justify-center"
                        variant="outline"
                        size="sm"
                      >
                        Add Field
                      </Button>
                    </div>
                    {error && (
                      <div className="text-red-500 text-sm">{error}</div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Configuration Fields */}
              <div className="flex-1 space-y-4">
                {Object.entries(config).map(([key, value]) => {
                  const valType: ValueType = determineType(value);
                  return (
                    <Card key={key} className="p-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <Label className="text-lg font-semibold">{key}</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteField([key])}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <ValueEditor
                          keyPath={[key]}
                          value={value}
                          type={valType}
                          onChange={handleUpdateValue}
                          onDelete={handleDeleteField}
                        />
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="flex-1 min-h-0 p-6 overflow-y-auto">
            <Card className="p-8 bg-white shadow-lg rounded-lg">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">Prompt Preview</h3>
              <pre className="whitespace-pre-wrap font-sans text-lg text-gray-700 bg-gray-100 p-6 rounded-lg">
                {formattedPrompt}
              </pre>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="p-4 border-t mt-auto">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
