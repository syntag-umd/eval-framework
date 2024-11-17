"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConversationDisplay } from "@/components/conversation-display";
import { ComparisonPromptEditor } from "@/components/comparison-prompt-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { EvaluationResult } from "@/lib/types";

interface EvaluationViewerProps {
  results: EvaluationResult[];
  isLoading: boolean;
  progress: number;
}

export function EvaluationViewer({
  results,
  isLoading,
  progress,
}: EvaluationViewerProps) {
  const [selectedResult, setSelectedResult] = useState<EvaluationResult | null>(
    null
  );

  const averageScore =
    results.length > 0
      ? results.reduce((acc, curr) => acc + curr.score, 0) / results.length
      : 0;

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Evaluation Results</h2>
        {isLoading ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Evaluating conversations... {Math.round(progress)}%
            </p>
            <Progress value={progress} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Average Score: {averageScore.toFixed(2)}%
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-2">
          {results.map((result) => (
            <Button
              key={result.index}
              variant={selectedResult?.index === result.index ? "secondary" : "ghost"}
              className="w-full justify-between"
              onClick={() => setSelectedResult(result)}
            >
              <span>Conversation {result.index + 1}</span>
              <div className="flex items-center gap-2">
                <span>{result.score}%</span>
                {result.error ? (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
              </div>
            </Button>
          ))}
        </div>

        <div className="md:col-span-3">
          {selectedResult ? (
            <div className="space-y-6">
              {selectedResult.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{selectedResult.error}</AlertDescription>
                </Alert>
              )}
              
              <ConversationDisplay
                messages={selectedResult.conversation}
                generatedMessage={selectedResult.details?.generatedMessage}
                idealMessage={selectedResult.details?.idealMessage}
                generatedToolCalls={selectedResult.details?.generatedToolCalls}
                idealToolCalls={selectedResult.details?.idealToolCalls}
              />
            </div>
          ) : (
            <div className="text-center text-muted-foreground p-12 border rounded-lg">
              Select a conversation to view details
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}