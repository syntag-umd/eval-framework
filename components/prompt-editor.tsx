"use client";

import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Save, AlertCircle, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { validatePromptTemplate } from "@/lib/prompt-builder";

interface PromptEditorProps {
  initialPrompt: string;
  onSave: (newPrompt: string) => void;
}

const RECOGNIZED_VARIABLES = [
  "shop_name",
  "shop_address",
  "shop_schedule",
  "hardcoded_datetime",
  "barbers",
  "services",
];

export function PromptEditor({ initialPrompt, onSave }: PromptEditorProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [highlightedPrompt, setHighlightedPrompt] = useState(initialPrompt);
  const [errors, setErrors] = useState<string[]>([]);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleSave = () => {
    const validation = validatePromptTemplate(prompt);

    if (validation.isValid) {
      setErrors([]);
      onSave(prompt);
      // Highlight variables after saving
      highlightVariables();
    } else {
      setErrors(validation.errors);
    }
  };

  const handleInputChange = (event: React.FormEvent<HTMLDivElement>) => {
    const newText = event.currentTarget.innerText;
    setPrompt(newText);
  };

  const highlightVariables = () => {
    let content = prompt;
    content = content.replace(
      /{{(.*?)}}/g,
      (_, variable) => {
        if (RECOGNIZED_VARIABLES.includes(variable.trim())) {
          return `<span class="recognized">{{${variable}}}</span>`;
        } else {
          return `<span class="unrecognized">{{${variable}}}</span>`;
        }
      }
    );
    setHighlightedPrompt(content);
  };

  return (
    <Card className="p-6">
      {/* Inline styles */}
      <style>
        {`
          .recognized {
            color: green;
            font-weight: bold;
          }
          .unrecognized {
            color: red;
            text-decoration: underline;
            font-weight: bold;
          }
        `}
      </style>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">System Prompt Template</h2>
          <TooltipProvider>
            <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTooltipOpen(!tooltipOpen)}
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="w-80">
                <p className="text-sm">
                  Available variables:
                  <br />
                  {'{{shop_name}}'}, {'{{shop_address}}'}, {'{{shop_schedule}}'}
                  , {'{{hardcoded_datetime}}'}, {'{{barbers}}'}, {'{{services}}'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Button onClick={handleSave} size="sm">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {errors.length > 0 && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc pl-4">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Editable div for input */}
      <div
        ref={contentRef}
        contentEditable
        onInput={handleInputChange}
        className={`min-h-[200px] p-4 border rounded-md font-mono text-sm focus:outline-none whitespace-pre-wrap ${
          prompt ? "" : "text-gray-400"
        }`}
        suppressContentEditableWarning={true}
      >
        {prompt || "Enter the system prompt template here..."}
      </div>

      {/* Highlighted preview */}
      <div
        className="mt-4 p-4 border rounded-md font-mono text-sm bg-gray-50"
        dangerouslySetInnerHTML={{ __html: highlightedPrompt }}
      />
    </Card>
  );
}
