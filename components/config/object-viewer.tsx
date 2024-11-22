"use client";

import { ConfigValueViewer } from "./config-value-viewer";

interface ObjectViewerProps {
  value: Record<string, any>;
  isNested?: boolean;
}

export function ObjectViewer({ value, isNested = false }: ObjectViewerProps) {
  return (
    <div className="space-y-4">
      {Object.entries(value).map(([key, val]) => (
        <div key={key} className="space-y-1">
          <div className="font-medium text-sm">{key}</div>
          <div className={isNested ? "ml-2" : "ml-4"}>
            <ConfigValueViewer value={val} />
          </div>
        </div>
      ))}
    </div>
  );
}