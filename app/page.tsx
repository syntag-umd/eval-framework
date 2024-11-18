'use client';

import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { MessageViewer } from '@/components/message-viewer';
import { FileList } from '@/components/file-list';
import { EvaluationViewer } from '@/components/evaluation-viewer';
import { JsonFormatTooltip } from '@/components/json-format-tooltip';
import { PromptEditor } from '@/components/prompt-editor';
import { ComparisonPromptEditor } from '@/components/comparison-prompt-editor';
import { ChatPlayground } from '@/components/chat-playground';
import { Upload, AlertCircle, Settings } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { evaluateConversations, DEFAULT_PROMPT } from '@/lib/evaluation';
import { type EvaluationResult } from '@/lib/types';
import OpenAI from 'openai';
import { Settings2 } from 'lucide-react';
import { useSettings } from '@/lib/settings';
import { SettingsPage } from '@/components/settings/settings-page';
import { DEFAULT_CONVERSATION_DATA } from '@/lib/default-data';
import { useConversationStore } from '@/lib/stores/conversation-store';

const DEFAULT_COMPARISON_PROMPT = `Compare the following two messages and rate their similarity on a scale from 1 to 100 based on content, tone, and brevity.
ONLY INCLUDE THE NUMBER IN YOUR RESPONSE.

### Generated Message:
{{generated_message}}

### Ideal Message:
{{ideal_message}}

### Rating (1-100):`;

export default function Home() {
  const [files, setFiles] = useState<string[]>([]);
  const [currentFile, setCurrentFile] = useState<string>('');
  const [currentKey, setCurrentKey] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationProgress, setEvaluationProgress] = useState(0);
  const [evaluationResults, setEvaluationResults] = useState<EvaluationResult[]>([]);
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_PROMPT);
  const [comparisonPrompt, setComparisonPrompt] = useState(DEFAULT_COMPARISON_PROMPT);
  const [activeTab, setActiveTab] = useState('viewer');
  const [isClient, setIsClient] = useState(false);

  const { apiKey, tools } = useSettings();
  const { savedConversations, addConversation } = useConversationStore();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const onDrop = (acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const jsonData = JSON.parse(reader.result as string);

          if (!validateConversationData(jsonData)) {
            throw new Error('Invalid conversation data format');
          }

          Object.entries(jsonData).forEach(([key, value]) => {
            addConversation(`${file.name}:${key}`, value as any);
          });

          setFiles((prev) => [...new Set([...prev, file.name])]);
          if (!currentFile) {
            setCurrentFile(file.name);
            setCurrentKey(`${file.name}:${Object.keys(jsonData)[0]}`);
          }
          setError('');
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Failed to parse JSON file');
          console.error('Failed to parse JSON:', e);
        }
      };
      reader.readAsText(file);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
    },
    multiple: true,
  });

  const validateConversationData = (data: any): boolean => {
    if (typeof data !== 'object' || data === null) return false;

    for (const key in data) {
      const conv = data[key];
      if (!Array.isArray(conv.input)) return false;
      if (!conv.output || typeof conv.output !== 'object') return false;
      if (typeof conv.output.message !== 'string') return false;
      if (!Array.isArray(conv.output.tool_calls)) return false;
    }
    return true;
  };

  const loadDefaultData = () => {
    Object.entries(DEFAULT_CONVERSATION_DATA).forEach(([key, value]) => {
      addConversation(`SynTag Conversation Data:${key}`, value as any);
    });
    
    setFiles((prev) => [...new Set([...prev, 'SynTag Conversation Data'])]);
    if (!currentFile) {
      setCurrentFile('SynTag Conversation Data');
      setCurrentKey(`SynTag Conversation Data:${Object.keys(DEFAULT_CONVERSATION_DATA)[0]}`);
    }
    setError('');
  };

  const startEvaluation = async () => {
    setIsEvaluating(true);
    setEvaluationProgress(0);
    setEvaluationResults([]);
    setActiveTab('evaluation');

    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
    });

    try {
      const conversationEntries = Object.entries(savedConversations);
      const results = await evaluateConversations(
        openai,
        conversationEntries,
        systemPrompt,
        comparisonPrompt,
        tools,
        (progress) => setEvaluationProgress(progress)
      );

      setEvaluationResults(results);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Evaluation failed');
    } finally {
      setIsEvaluating(false);
    }
  };

  const filterByFile = (fileName: string) => {
    setCurrentFile(fileName);
    const firstKeyForFile = Object.keys(savedConversations).find((key) =>
      key.startsWith(fileName + ':')
    );
    if (firstKeyForFile) {
      setCurrentKey(firstKeyForFile);
    }
  };

  const conversationKeys = Object.keys(savedConversations).filter((key) =>
    key.startsWith(currentFile + ':')
  );

  const currentIndex = conversationKeys.indexOf(currentKey);

  const handlePrevious = () => {
    const newIndex =
      currentIndex > 0 ? currentIndex - 1 : conversationKeys.length - 1;
    setCurrentKey(conversationKeys[newIndex]);
  };

  const handleNext = () => {
    const newIndex =
      currentIndex < conversationKeys.length - 1 ? currentIndex + 1 : 0;
    setCurrentKey(conversationKeys[newIndex]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Evaluation Framework
        </h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                Drag & drop JSON files here, or click to select files
              </p>
              <div className="mt-4">
                <JsonFormatTooltip />
              </div>
              <Button 
                variant="outline" 
                className="mt-4 w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  loadDefaultData();
                }}
              >
                Load Sample Data
              </Button>
            </div>

            <div className="mt-6">
              <FileList
                files={files}
                onFileSelect={filterByFile}
                currentFile={currentFile}
              />
            </div>

            {Object.keys(savedConversations).length > 0 && (
              <Button
                className="w-full mt-4"
                onClick={startEvaluation}
                disabled={isEvaluating}
              >
                {isEvaluating ? 'Evaluating...' : 'Evaluate Conversations'}
              </Button>
            )}
          </div>

          <div className="md:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="viewer">Conversation Viewer</TabsTrigger>
                <TabsTrigger value="evaluation">Evaluation Results</TabsTrigger>
                <TabsTrigger value="prompts">Prompts</TabsTrigger>
                <TabsTrigger value="playground">Playground</TabsTrigger>
                <TabsTrigger value="settings" className="relative">
                  <Settings2 className="h-4 w-4 mr-2" />
                  Settings
                  {isClient && !apiKey && (
                    <AlertCircle className="h-3 w-3 text-red-500 absolute -top-1 -right-1" />
                  )}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="settings">
                <SettingsPage />
              </TabsContent>

              <TabsContent value="viewer">
                {currentKey && savedConversations[currentKey] ? (
                  <MessageViewer
                    conversation={savedConversations[currentKey]}
                    currentIndex={currentIndex}
                    total={conversationKeys.length}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                    dialogId={currentKey.split(':')[1]}
                  />
                ) : (
                  <div className="text-center text-muted-foreground p-12 border rounded-lg">
                    {files.length > 0
                      ? 'Select a file to view conversations'
                      : 'Upload a JSON file to start visualizing conversations'}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="evaluation">
                <EvaluationViewer
                  results={evaluationResults}
                  isLoading={isEvaluating}
                  progress={evaluationProgress}
                />
              </TabsContent>

              <TabsContent value="prompts">
                <div className="space-y-6">
                  <PromptEditor
                    initialPrompt={systemPrompt}
                    onSave={setSystemPrompt}
                  />
                  <ComparisonPromptEditor
                    initialPrompt={comparisonPrompt}
                    onSave={setComparisonPrompt}
                  />
                </div>
              </TabsContent>

              <TabsContent value="playground">
                <ChatPlayground systemPrompt={systemPrompt} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}