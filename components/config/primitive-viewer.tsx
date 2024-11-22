"use client";

interface PrimitiveViewerProps {
  value: string | number | boolean;
}

export function PrimitiveViewer({ value }: PrimitiveViewerProps) {
  if (typeof value === 'boolean') {
    return (
      <span
        className={`px-2 py-1 rounded-full text-sm ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}
      >
        {value.toString()}
      </span>
    );
  }

  if (typeof value === 'number') {
    return <span className="font-mono">{value}</span>;
  }

  if (typeof value === 'string') {
    // Try to parse as date
    const date = new Date(value);
    if (!isNaN(date.getTime()) && value.includes('T')) {
      return (
        <span className="text-muted-foreground">
          {date.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })}
        </span>
      );
    }

    // If not a date, render the string normally
    return <span className="text-primary">{value}</span>;
  }

  // Fallback for unsupported types (optional)
  return <span className="text-error">Unsupported value type</span>;
}
