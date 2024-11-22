"use client";

import { PrimitiveViewer } from "./primitive-viewer";
import { ArrayViewer } from "./array-viewer";
import { ObjectViewer } from "./object-viewer";
import { JsonViewer } from "./json-viewer";

interface ConfigValueViewerProps {
  value: any;
  isNested?: boolean;
}

export function ConfigValueViewer({ value, isNested = false }: ConfigValueViewerProps) {
  // Handle null or undefined
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground italic">Not set</span>;
  }

  // Handle primitives
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return <PrimitiveViewer value={value} />;
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return <ArrayViewer value={value} isNested={isNested} />;
  }

  // Handle objects
  if (typeof value === 'object') {
    // Check if it's a "simple" object (only contains primitive values)
    const isSimpleObject = Object.values(value).every(
      v => typeof v !== 'object' || v === null
    );

    if (isSimpleObject) {
      return <ObjectViewer value={value} isNested={isNested} />;
    }

    // For complex objects, use JsonViewer
    return <JsonViewer value={value} />;
  }

  // Fallback for unknown types
  return <span className="text-muted-foreground">Unsupported value type</span>;
}