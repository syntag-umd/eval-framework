'use client';

import React, { useEffect, useState } from 'react';
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
import { evaluateConversations } from '@/lib/evaluation';
import { type EvaluationResult, type ConversationData } from '@/lib/types';
import OpenAI from 'openai';
import { Settings2 } from 'lucide-react';
import { useSettings } from '@/lib/settings';
import { SettingsPage } from '@/components/settings/settings-page';
import { DEFAULT_CONVERSATION_DATA } from '@/lib/default-data';
import { DEFAULT_EVALUATION_RESULTS } from '@/lib/default-evaluation-results';
import { usePromptStore } from '@/lib/stores/prompt-store';

const DEFAULT_COMPARISON_PROMPT = `Compare the following two messages and rate their similarity on a scale from 1 to 100 based on content, tone, and brevity.
ONLY INCLUDE THE NUMBER IN YOUR RESPONSE.

### Generated Message:
{{generated_message}}

### Ideal Message:
{{ideal_message}}

### Rating (1-100):`;

interface FileConversations {
  [fileName: string]: any;
}

export default function Home() {
  const [fileConversations, setFileConversations] = useState<FileConversations>({});
  const [files, setFiles] = useState<string[]>([]);
  const [currentFile, setCurrentFile] = useState<string>('');
  const [currentKey, setCurrentKey] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationProgress, setEvaluationProgress] = useState(0);
  const [evaluationResults, setEvaluationResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('viewer');
  const [isClient, setIsClient] = useState(false);

  const { apiKey, tools } = useSettings();
  const { 
    systemPrompt, 
    comparisonPrompt, 
    setSystemPrompt, 
    setComparisonPrompt 
  } = usePromptStore();

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

          setFileConversations(prev => ({
            ...prev,
            [file.name]: jsonData
          }));

          setFiles((prev) => [...new Set([...prev, file.name])]);
          if (!currentFile) {
            setCurrentFile(file.name);
            const firstKey = Object.keys(jsonData)[0];
            setCurrentKey(`${file.name}:${firstKey}`);
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
    setFileConversations(prev => ({
      ...prev,
      'SynTag Conversation Data': DEFAULT_CONVERSATION_DATA
    }));
    
    setFiles((prev) => [...new Set([...prev, 'SynTag Conversation Data'])]);
    if (!currentFile) {
      setCurrentFile('SynTag Conversation Data');
      const firstKey = Object.keys(DEFAULT_CONVERSATION_DATA)[0];
      setCurrentKey(`SynTag Conversation Data:${firstKey}`);
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
      // Convert fileConversations to array of [key, value] pairs
      const allConversations: Array<[string, any]> = [];
      Object.entries(fileConversations).forEach(([fileName, conversations]) => {
        Object.entries(conversations).forEach(([convId, conv]) => {
          allConversations.push([`${fileName}:${convId}`, conv]);
        });
      });

      const results = await evaluateConversations(
        openai,
        allConversations,
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

  const loadPrecomputedResults = () => {
    setIsEvaluating(true);
    setEvaluationProgress(0);
    setEvaluationResults([]);
    setActiveTab('evaluation');

    // Simulate loading progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setEvaluationProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setEvaluationResults(DEFAULT_EVALUATION_RESULTS);
        setIsEvaluating(false);
      }
    }, 100);
  };

  const filterByFile = (fileName: string) => {
    setCurrentFile(fileName);
    const conversations = fileConversations[fileName];
    if (conversations) {
      const firstKey = Object.keys(conversations)[0];
      setCurrentKey(`${fileName}:${firstKey}`);
    }
  };

  const handleDeleteFile = (fileName: string) => {
    setFileConversations(prev => {
      const newConversations = { ...prev };
      delete newConversations[fileName];
      return newConversations;
    });
    
    setFiles(prev => prev.filter(f => f !== fileName));
    
    if (currentFile === fileName) {
      const remainingFiles = files.filter(f => f !== fileName);
      if (remainingFiles.length > 0) {
        filterByFile(remainingFiles[0]);
      } else {
        setCurrentFile('');
        setCurrentKey('');
      }
    }
  };

  const getCurrentConversation = () => {
    if (!currentKey) return null;
    const [fileName, convId] = currentKey.split(':');
    return fileConversations[fileName]?.[convId];
  };

  const conversationKeys = currentFile ? 
    Object.keys(fileConversations[currentFile] || {}).map(key => `${currentFile}:${key}`) : 
    [];

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

  const isSampleData = 
    files.length === 1 && 
    files[0] === 'SynTag Conversation Data' && 
    Object.keys(fileConversations).length === 1 &&
    fileConversations['SynTag Conversation Data'] === DEFAULT_CONVERSATION_DATA;

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
                onFileDelete={handleDeleteFile}
                currentFile={currentFile}
              />
            </div>

            {Object.keys(fileConversations).length > 0 && (
              <div className="space-y-2 mt-4">
                <Button
                  className="w-full"
                  onClick={startEvaluation}
                  disabled={isEvaluating}
                >
                  {isEvaluating ? 'Evaluating...' : 'Evaluate Conversations'}
                </Button>
                
                {isSampleData && (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={loadPrecomputedResults}
                    disabled={isEvaluating}
                  >
                    Show precomputed analysis
                  </Button>
                )}
              </div>
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
                {currentKey && getCurrentConversation() ? (
                  <MessageViewer
                    conversation={getCurrentConversation()!}
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