import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface FileListProps {
  files: string[];
  onFileSelect: (fileName: string) => void;
  currentFile: string;
}

export function FileList({ files, onFileSelect, currentFile }: FileListProps) {
  return (
    <div className="border rounded-lg">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Uploaded Files</h2>
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
                <Button
                  key={file}
                  variant={file === currentFile ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => onFileSelect(file)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span className="truncate">{file}</span>
                </Button>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}