"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Download } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConversationDisplay } from "@/components/conversation-display";
import { ComparisonPromptEditor } from "@/components/comparison-prompt-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useModelStore } from "@/lib/stores/model-store";
import { ModelSelector } from "./model-selector";
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

  const { evaluationModel, setEvaluationModel } = useModelStore();

  const averageScore =
    results.length > 0
      ? results.reduce((acc, curr) => acc + curr.score, 0) / results.length
      : 0;

  // Sort results by score (ascending)
  const sortedResults = [...results].sort((a, b) => a.score - b.score);

  const handleExportResults = () => {
    const exportData = {
      summary: {
        totalConversations: results.length,
        averageScore: averageScore,
        timestamp: new Date().toISOString(),
      },
      results: results.map(result => ({
        ...result,
        // Clean up the data for export by removing undefined values
        details: result.details ? {
          generatedMessage: result.details.generatedMessage || null,
          idealMessage: result.details.idealMessage || null,
          generatedToolCalls: result.details.generatedToolCalls || [],
          idealToolCalls: result.details.idealToolCalls || [],
        } : null,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evaluation-results-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex-shrink-0 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Evaluation Results</h2>
              {!isLoading && (
                <p className="text-sm text-muted-foreground">
                  Average Score: {averageScore.toFixed(2)}%
                </p>
              )}
            </div>
            <ModelSelector value={evaluationModel} onValueChange={setEvaluationModel} />
          </div>
          {results.length > 0 && !isLoading && (
            <Button variant="outline" onClick={handleExportResults}>
              <Download className="h-4 w-4 mr-2" />
              Export Results
            </Button>
          )}
        </div>
        {isLoading && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Evaluating conversations... {Math.round(progress)}%
            </p>
            <Progress value={progress} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 min-h-0 flex-grow">
        <ScrollArea className="h-full">
          <div className="space-y-2 pr-4">
            {sortedResults.map((result) => (
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
        </ScrollArea>

        <div className="md:col-span-3 h-full flex flex-col min-h-0">
          {selectedResult ? (
            <div className="flex flex-col h-full min-h-0">
              {selectedResult.error && (
                <Alert variant="destructive" className="mb-4 flex-shrink-0">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{selectedResult.error}</AlertDescription>
                </Alert>
              )}
              
              <div className="flex-grow min-h-0">
                <ConversationDisplay
                  messages={selectedResult.conversation}
                  generatedMessage={selectedResult.details?.generatedMessage}
                  idealMessage={selectedResult.details?.idealMessage}
                  generatedToolCalls={selectedResult.details?.generatedToolCalls}
                  idealToolCalls={selectedResult.details?.idealToolCalls}
                />
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground p-12 border rounded-lg h-full flex items-center justify-center">
              Select a conversation to view details
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}