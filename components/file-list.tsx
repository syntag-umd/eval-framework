import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { FileText, Trash2 } from "lucide-react";

interface FileListProps {
  files: string[];
  onFileSelect: (fileName: string) => void;
  onFileDelete: (fileName: string) => void;
  currentFile: string;
}

export function FileList({ files, onFileSelect, onFileDelete, currentFile }: FileListProps) {
  return (
    <div className="border rounded-lg">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Uploaded Files ({files.length})</h2>
      </div>
      <ScrollArea className="h-[300px]">
        <div className="p-4">
          {files.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center">
              No files uploaded
            </p>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <div key={file} className="flex items-center gap-2">
                  <Button
                    variant={file === currentFile ? "secondary" : "ghost"}
                    className="flex-grow justify-start"
                    onClick={() => onFileSelect(file)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    <span className="truncate">{file}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onFileDelete(file)}
                    className="flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}