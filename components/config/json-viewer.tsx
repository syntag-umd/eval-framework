"use client";

interface JsonViewerProps {
  value: any;
}

export function JsonViewer({ value }: JsonViewerProps) {
  return (
    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}