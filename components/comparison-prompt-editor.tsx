"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface ComparisonPromptEditorProps {
  initialPrompt: string;
  onSave: (newPrompt: string) => void;
}

export function ComparisonPromptEditor({ initialPrompt, onSave }: ComparisonPromptEditorProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [highlightedPrompt, setHighlightedPrompt] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const highlightVariables = (text: string) => {
    return text.replace(
      /{{(.*?)}}/g,
      (match) => `<span class="recognized">${match}</span>`
    );
  };

  useEffect(() => {
    setHighlightedPrompt(highlightVariables(initialPrompt));
    if (contentRef.current) {
      contentRef.current.innerText = initialPrompt;
    }
  }, [initialPrompt]);

  const handleSave = () => {
    onSave(prompt);
    setIsSaved(true);
  };

  const handleInputChange = (event: React.FormEvent<HTMLDivElement>) => {
    const newText = event.currentTarget.innerText;
    setPrompt(newText);
    setHighlightedPrompt(highlightVariables(newText));
    setIsSaved(false);
  };

  return (
    <Card className="p-6">
      <style>
        {`
          .recognized {
            color: green;
            font-weight: bold;
          }
        `}
      </style>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Comparison Prompt Template</h2>
        <Button 
          onClick={handleSave} 
          size="sm"
          variant={isSaved ? "outline" : "default"}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <div
        ref={contentRef}
        contentEditable
        onInput={handleInputChange}
        className="min-h-[200px] p-4 border rounded-md font-mono text-sm focus:outline-none whitespace-pre-wrap"
        suppressContentEditableWarning={true}
      />

      <div
        className="mt-4 p-4 border rounded-md font-mono text-sm bg-gray-50"
        dangerouslySetInnerHTML={{ __html: highlightedPrompt }}
      />
    </Card>
  );
}