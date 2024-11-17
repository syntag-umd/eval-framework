"use client";

import { useState, useRef, useEffect } from "react";
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

interface ComparisonPromptEditorProps {
  initialPrompt: string;
  onSave: (newPrompt: string) => void;
}

export function ComparisonPromptEditor({ initialPrompt, onSave }: ComparisonPromptEditorProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [highlightedPrompt, setHighlightedPrompt] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const validatePrompt = (text: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const requiredVariables = ['generated_message', 'ideal_message'];
    
    requiredVariables.forEach(variable => {
      if (!text.includes(`{{${variable}}}`)) {
        errors.push(`Missing required variable: {{${variable}}}`);
      }
    });

    const variableRegex = /\{\{(\w+)\}\}/g;
    const matches = text.match(variableRegex) || [];
    matches.forEach(match => {
      const variable = match.slice(2, -2);
      if (!requiredVariables.includes(variable)) {
        errors.push(`Invalid variable: ${variable}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const highlightVariables = (text: string) => {
    return text.replace(
      /{{(.*?)}}/g,
      (_, variable) => {
        if (['generated_message', 'ideal_message'].includes(variable.trim())) {
          return `<span class="recognized">{{${variable}}}</span>`;
        } else {
          return `<span class="unrecognized">{{${variable}}}</span>`;
        }
      }
    );
  };

  useEffect(() => {
    setHighlightedPrompt(highlightVariables(initialPrompt));
    if (contentRef.current) {
      contentRef.current.innerText = initialPrompt;
    }
  }, [initialPrompt]);

  const handleSave = () => {
    const validation = validatePrompt(prompt);

    if (validation.isValid) {
      setErrors([]);
      onSave(prompt);
      setIsSaved(true);
    } else {
      setErrors(validation.errors);
    }
  };

  const handleInputChange = (event: React.FormEvent<HTMLDivElement>) => {
    const newText = event.currentTarget.innerText;
    setPrompt(newText);
    setHighlightedPrompt(highlightVariables(newText));
    setIsSaved(false);
  };

  const isEmpty = !prompt.trim();

  return (
    <Card className="p-6 relative">
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
          .placeholder {
            position: absolute;
            top: 16px;
            left: 16px;
            color: #a1a1aa; /* Tailwind's gray-400 */
            pointer-events: none;
            user-select: none;
            font-family: inherit;
            font-size: 0.875rem; /* text-sm */
          }
        `}
      </style>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Comparison Prompt Template</h2>
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
                  {'{{generated_message}}'}, {'{{ideal_message}}'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Button 
          onClick={handleSave} 
          size="sm"
          variant={isSaved ? "outline" : "default"}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaved ? "Saved!" : "Save Changes"}
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

      <div className="relative">
        {isEmpty && (
          <div className="placeholder">
            Enter the comparison prompt template here...
          </div>
        )}
        <div
          ref={contentRef}
          contentEditable
          onInput={handleInputChange}
          className="min-h-[200px] p-4 border rounded-md font-mono text-sm focus:outline-none whitespace-pre-wrap"
          suppressContentEditableWarning={true}
        />
      </div>

      <div
        className="mt-4 p-4 border rounded-md font-mono text-sm bg-gray-50 whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: highlightedPrompt }}
      />
    </Card>
  );
}
