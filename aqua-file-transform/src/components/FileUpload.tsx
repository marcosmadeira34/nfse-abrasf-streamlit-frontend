// Fileupload.tsx
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, X, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: "uploading" | "completed" | "error";
  progress: number;
}

interface FileUploadProps {
  onFileUpload?: (files: File[]) => void;
}

const FileUpload = ({ onFileUpload }: FileUploadProps) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const simulateUpload = (fileId: string) => {
    // console.log(`[simulateUpload] Iniciando upload simulado para ID: ${fileId}`);
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        setFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, status: "completed", progress: 100 }
            : f
        ));
        // console.log(`[simulateUpload] Upload concluído para ID: ${fileId}`);
        clearInterval(interval);
      } else {
        setFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, progress }
            : f
        ));
        // console.log(`[simulateUpload] Progresso para ID: ${fileId}: ${progress.toFixed(0)}%`);
      }
    }, 200);
  };

      // start comment: FileUpload.tsx ajustes para enviar arquivos reais

    const handleFileSelect = (selectedFiles: FileList | null) => {
      // console.log(`[handleFileSelect] Arquivos selecionados:`, selectedFiles);
      if (!selectedFiles) return;

          const newFiles: UploadedFile[] = Array.from(selectedFiles).map(file => {
          // console.log(`[handleFileSelect] Adicionando arquivo:`, file.name, file.size);
          return {
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: file.size,
            status: "uploading",
            progress: 0
          };
        });

        setFiles(prev => {
          const updated = [...prev, ...newFiles];
          // console.log(`[handleFileSelect] Estado de arquivos atualizado:`, updated);
          return updated;
        });

        newFiles.forEach(file => simulateUpload(file.id));

        if (newFiles.length > 0 && onFileUpload) {
          // console.log(`[handleFileSelect] Chamando onFileUpload com os arquivos reais:`, Array.from(selectedFiles));
          onFileUpload(Array.from(selectedFiles));
        }
      };


    // end comment

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  return (
    <Card className="gradient-card shadow-card animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Upload className="w-5 h-5" />
          Upload de Arquivos PDF
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          className={cn(
            "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300",
            isDragOver 
              ? "border-secondary bg-secondary/5 scale-105" 
              : "border-border hover:border-secondary/60 hover:bg-muted/30"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
          
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center animate-float">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                Arraste arquivos PDF aqui
              </h3>
              <p className="text-muted-foreground">
                ou clique para selecionar arquivos
              </p>
            </div>
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="gradient-primary text-primary-foreground hover:scale-105 transition-transform"
            >
              Selecionar Arquivos
            </Button>
          </div>
        </div>

        {files.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Arquivos Carregados</h4>
            {files.map((file, index) => (
              <div
                key={file.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border bg-card",
                  "animate-scale-in"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-2 rounded bg-primary/10">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm truncate text-foreground">
                      {file.name}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                  
                  {file.status === "uploading" && (
                    <Progress value={file.progress} className="h-1" />
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {file.status === "completed" && (
                    <CheckCircle className="w-4 h-4 text-secondary" />
                  )}
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFile(file.id)}
                    className="h-6 w-6 p-0 hover:bg-destructive/10"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUpload;