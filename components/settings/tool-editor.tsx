"use client";

import { useState } from 'react';
import { Tool } from '@/lib/settings';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronUp, Plus, Trash2, X } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ToolEditorProps {
  tool: Tool;
  onUpdate: (tool: Tool) => void;
  onDelete: () => void;
}

export function ToolEditor({ tool, onUpdate, onDelete }: ToolEditorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNameChange = (name: string) => {
    onUpdate({
      ...tool,
      function: {
        ...tool.function,
        name,
      },
    });
  };

  const handleDescriptionChange = (description: string) => {
    onUpdate({
      ...tool,
      function: {
        ...tool.function,
        description,
      },
    });
  };

  const handleAddParameter = () => {
    onUpdate({
      ...tool,
      function: {
        ...tool.function,
        parameters: {
          ...tool.function.parameters,
          properties: {
            ...tool.function.parameters.properties,
            [`param_${Object.keys(tool.function.parameters.properties).length + 1}`]: {
              type: 'string',
              description: '',
            },
          },
        },
      },
    });
  };

  const handleUpdateParameter = (
    oldName: string,
    newName: string,
    updates: Partial<{ type: string; description: string; required: boolean }>
  ) => {
    const newProperties = { ...tool.function.parameters.properties };
    const required = new Set(tool.function.parameters.required);
  
    // If the parameter is being renamed
    if (oldName !== newName) {
      delete newProperties[oldName];
      if (required.has(oldName)) {
        required.delete(oldName);
      }
    }
  
    // Destructure 'required' from updates to exclude it from parameter properties
    const { required: isRequired, ...paramUpdates } = updates;

    newProperties[newName] = {
        ...newProperties[oldName],
        ...paramUpdates, // Spread updates without 'required'
    };
  
    if (updates.required !== undefined) {
      if (updates.required) {
        required.add(newName);
      } else {
        required.delete(newName);
      }
    }
  
    onUpdate({
      ...tool,
      function: {
        ...tool.function,
        parameters: {
          ...tool.function.parameters,
          properties: newProperties,
          required: Array.from(required),
        },
      },
    });
  };

  const handleDeleteParameter = (name: string) => {
    const newProperties = { ...tool.function.parameters.properties };
    delete newProperties[name];
    const required = new Set(tool.function.parameters.required);
    required.delete(name);

    onUpdate({
      ...tool,
      function: {
        ...tool.function,
        parameters: {
          ...tool.function.parameters,
          properties: newProperties,
          required: Array.from(required),
        },
      },
    });
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">
              {tool.function.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={tool.function.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={tool.function.description}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                />
              </div>
            </div>

            {/* Parameters */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Parameters</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddParameter}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Parameter
                </Button>
              </div>

              <div className="space-y-4">
                {Object.entries(tool.function.parameters.properties).map(([name, param]) => (
                  <Card key={name} className="p-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <Input
                            value={name}
                            onChange={(e) =>
                              handleUpdateParameter(name, e.target.value, {})
                            }
                            placeholder="Parameter name"
                          />
                        </div>
                        <Select
                          value={param.type}
                          onValueChange={(value) =>
                            handleUpdateParameter(name, name, { type: value })
                          }
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="string">String</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="boolean">Boolean</SelectItem>
                            <SelectItem value="integer">Integer</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteParameter(name)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          value={param.description || ''}
                          onChange={(e) =>
                            handleUpdateParameter(name, name, {
                              description: e.target.value,
                            })
                          }
                          placeholder="Parameter description"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`${name}-required`}
                          checked={tool.function.parameters.required.includes(name)}
                          onCheckedChange={(checked) =>
                            handleUpdateParameter(name, name, {
                              required: checked,
                            })
                          }
                        />
                        <Label htmlFor={`${name}-required`}>Required</Label>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}