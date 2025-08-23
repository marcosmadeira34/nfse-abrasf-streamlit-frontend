//src/components/FileUpload.tsx
import { useState, useRef, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, X, CheckCircle, Plus, FolderPlus, Send, Trash2, Settings, Download, MoreVertical, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { callDjangoBackend } from "@/lib/api";
import { v4 as uuidv4} from "uuid";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  file: File;
  status: "pending" | "uploading" | "processing" | "completed" | "error";
  progress: number;
}

interface ConversionQueue {
  id: string;
  name: string;
  description: string;
  files: UploadedFile[];
  createdAt: Date;
  status: "draft" | "processing" | "completed" | "error";
}

interface FileUploadProps {
  onQueueComplete?: (queue: ConversionQueue) => void;
}

// Interface para armazenar informações de tarefas em andamento
interface ActiveTask {
  taskId: string;
  jobId: string;
  queueId: string;
  timestamp: string;
}

const FileUpload = ({ onQueueComplete }: FileUploadProps) => {
  const [queues, setQueues] = useState<ConversionQueue[]>([]);
  const [expandedQueueId, setExpandedQueueId] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newQueueName, setNewQueueName] = useState("");
  const [newQueueDescription, setNewQueueDescription] = useState("");
  const [fileToRemove, setFileToRemove] = useState<{ queueId: string; fileId: string } | null>(null);
  const [activeTasks, setActiveTasks] = useState<ActiveTask[]>([]);
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const createNewQueue = () => {
    if (!newQueueName.trim()) return;
    const newQueue: ConversionQueue = {
      id: uuidv4(),
      name: newQueueName,
      description: newQueueDescription,
      files: [],
      createdAt: new Date(),
      status: "draft"
    };
    setQueues(prev => [...prev, newQueue]);
    setExpandedQueueId(newQueue.id);
    setNewQueueName("");
    setNewQueueDescription("");
    setIsCreateDialogOpen(false);
    toast.success(`Fila "${newQueue.name}" criada com sucesso!`);
  };

  const simulateUpload = (queueId: string, fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        setQueues(prev => prev.map(q => {
          if (q.id === queueId) {
            const updatedFiles = q.files.map(f => {
              if (f.id === fileId) {
                return { ...f, status: "completed" as const, progress: 100 };
              }
              return f;
            });
            return { ...q, files: updatedFiles };
          }
          return q;
        }));
        clearInterval(interval);
      } else {
        setQueues(prev => prev.map(q => 
          q.id === queueId 
            ? {
                ...q,
                files: q.files.map(f => 
                  f.id === fileId 
                    ? { ...f, progress }
                    : f
                )
              }
            : q
        ));
      }
    }, 200);
  };

  const handleFileSelect = (queueId: string, selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];
    Array.from(selectedFiles).forEach(file => {
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });
    if (invalidFiles.length) {
      toast.error(`Arquivos inválidos: ${invalidFiles.join(", ")}. Apenas arquivos PDF são permitidos.`);
    }

    const newFiles: UploadedFile[] = validFiles.map(f => ({
      id: uuidv4(),
      name: f.name,
      size: f.size,
      file: f,
      status: "pending",
      progress: 0
    }));
    setQueues(prev => prev.map(q => 
      q.id === queueId 
        ? { ...q, files: [...q.files, ...newFiles] }
        : q
    ));
    newFiles.forEach(file => simulateUpload(queueId, file.id));
    toast.success(`${validFiles.length} arquivo(s) adicionado(s) à fila!`);
  };

  const removeFile = (queueId: string, fileId: string) => {
    setQueues(prev => prev.map(q => 
      q.id === queueId 
        ? { ...q, files: q.files.filter(f => f.id !== fileId) }
        : q
    ));
    toast.success("Arquivo removido da fila!");
  };

  const checkTaskStatus = async (taskId: string, jobId: string, queueId: string) => {
    try {
      const backendUrl = import.meta.env.VITE_DJANGO_BACKEND_URL;
      const token = localStorage.getItem("access_token");    
      if (!token) {
        console.error("Token não encontrado no localStorage");
        setQueues(prev => prev.map(q => 
          q.id === queueId 
            ? { ...q, status: "error" }
            : q
        ));
        toast.error("Sessão expirada. Faça login novamente.");
        // Remover a tarefa da lista de ativas
        setActiveTasks(prev => prev.filter(task => task.taskId !== taskId));
        return;
      }
      
      const url_response = `${backendUrl}/api/task-status/${taskId}/`;
      console.log("Verificando status da tarefa:", url_response);
      
      const response = await fetch(url_response, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
     
      if (!response.ok) {
        const text = await response.text();
        console.error("Erro ao verificar status. Resposta bruta:", text);
        setTimeout(() => checkTaskStatus(taskId, jobId, queueId), 3000);
        return;
      }
      
      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
        console.log("Dados recebidos:", data);
      } else {
        const text = await response.text();
        console.error("Resposta não é JSON:", text);
        setTimeout(() => checkTaskStatus(taskId, jobId, queueId), 3000);
        return;
      }
      
      if (data.state === "SUCCESS") {
        const zipUrl = data.meta?.zip_id ? `${backendUrl}/api/download-zip/${data.meta.zip_id}/` : null;
        console.log("Processamento concluído com sucesso. URL do ZIP:", zipUrl);
        const queue = queues.find(q => q.id === queueId);
        
        setQueues(prev =>
          prev.map(q =>
            q.id === queueId
              ? { ...q, status: "completed" }
              : q
          )
        );
        
        // Remover a tarefa da lista de ativas
        setActiveTasks(prev => prev.filter(task => task.taskId !== taskId));
        
        if (zipUrl) {
          toast.success(`Processamento da fila "${queue?.name || 'Desconhecida'}" concluído!`, {
            description: "Os arquivos já estão prontos para download.",
            duration: 3000,
            action: (
              <Button
                size="sm"
                onClick={() => {
                  window.open(zipUrl, "_blank");
                  toast.dismiss();
                }}
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            ),
          });
          
          const conversionData = {
            taskId,
            zipId: data.meta.zip_id,
            queueName: queues.find(q => q.id === queueId)?.name || "Desconhecida",
            queueId: queueId,
            xmlData: data.meta.arquivos_resultado,
            timestamp: new Date().toISOString()
          };
          
          localStorage.setItem(`conversionData_${queueId}`, JSON.stringify(conversionData));
          const userId = getUserIdFromToken();
          const xmlFiles = Object.entries(data.meta.arquivos_resultado).map(([fileName, content]) => ({
            id: uuidv4(),
            fileName,
            queueName: queues.find(q => q.id === queueId)?.name || "Fila Desconhecida",
            xmlContent: { content },
            validationStatus: 'pendente',
            anomalies: [],
            createdAt: new Date().toISOString(),
          }));
          localStorage.setItem(`xmlFiles_${userId}_${queueId}`, JSON.stringify(xmlFiles));
        }
      } else if (data.state === "FAILURE") {
        console.error("Falha no processamento da tarefa:", data);
        setQueues(prev => prev.map(q => 
          q.id === queueId 
            ? { ...q, status: "error" }
            : q
        ));
        // Remover a tarefa da lista de ativas
        setActiveTasks(prev => prev.filter(task => task.taskId !== taskId));
        toast.error("Erro ao processar seus arquivos.");
      } else {
        console.log("Status da tarefa:", data.state, "- Continuando a verificar...");
        setTimeout(() => checkTaskStatus(taskId, jobId, queueId), 3000);
      }
    } catch (err) {
      console.error("Erro ao verificar status em fila", err);
      setTimeout(() => checkTaskStatus(taskId, jobId, queueId), 3000);
    }
  };

  const startConversion = async (queueId: string) => {
    const queue = queues.find(q => q.id === queueId);
    if (!queue || queue.files.length === 0) {
      toast.error("Nenhum arquivo na fila selecionada.");
      return;
    }
    
    const defaultFormat = "xml";
    setQueues(prev => prev.map(q => 
      q.id === queueId 
        ? { ...q, status: "processing" }
        : q
    ));
    
    try {
      toast.info(`Processamento da fila ${queue.name} iniciado.`, {});
      const filesToSend = queue.files.map(f => f.file);
      const response = await callDjangoBackend("/api/upload-e-processar-pdf/", "POST", { output_format: defaultFormat }, filesToSend);
      
      console.log("Resposta da API:", response);
      
      const taskId = response?.task_id;
      const jobId = Math.random().toString(36).substr(2, 9);
      
      if (taskId) {
        // Adicionar a tarefa à lista de ativas
        const newTask: ActiveTask = {
          taskId,
          jobId,
          queueId,
          timestamp: new Date().toISOString()
        };
        
        setActiveTasks(prev => [...prev, newTask]);
        localStorage.setItem('activeTasks', JSON.stringify([...activeTasks, newTask]));
        
        checkTaskStatus(taskId, jobId, queueId);
      } else {
        setQueues(prev => prev.map(q => 
          q.id === queueId 
            ? { ...q, status: "error" }
            : q
        ));
        toast.error("Erro ao iniciar o processamento. Não foi recebido um ID de tarefa.");
      }
    } catch (error) {
      console.error("Erro na conversão:", error);
      setQueues(prev => prev.map(q => 
        q.id === queueId 
          ? { ...q, status: "error" }
          : q
      ));
      toast.error("Erro ao processar arquivos.");
    }
  };
  
  function getUserIdFromToken() {
    const token = localStorage.getItem("access_token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.user_id || payload.sub || payload.email || null;
    } catch (error) {
      console.error("Erro ao decodificar token", error);
      return null;
    }
  }

  const cleanOldData = () => {
    const userId = getUserIdFromToken();
    if (!userId) return;
    
    const now = new Date();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 dias
    
    Object.keys(localStorage)
      .filter(key => key.startsWith('conversionData_'))
      .forEach(key => {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          if (data.timestamp && now.getTime() - new Date(data.timestamp).getTime() > maxAge) {
            localStorage.removeItem(key);
            localStorage.removeItem(`xmlFiles_${userId}_${key.replace('conversionData_', '')}`);
          }
        } catch (error) {
          console.error("Erro ao limpar dados antigos:", error);
        }
      });
  };

  // Carregar filas salvas e tarefas ativas
  useEffect(() => {
    const userId = getUserIdFromToken();
    if (userId) {
      const savedQueues = localStorage.getItem(`conversionQueues_${userId}`);
      if (savedQueues) {
        try {
          const parsed = JSON.parse(savedQueues);
          parsed.forEach((q: any) => {
            q.createdAt = new Date(q.createdAt);
            if (!["draft", "processing", "completed"].includes(q.status)) {
              q.status = "draft";
            }
          });
          setQueues(parsed);
          
          const savedExpandedQueueId = localStorage.getItem(`expandedQueueId_${userId}`);
          if (savedExpandedQueueId && parsed.some((q: any) => q.id === savedExpandedQueueId)) {
            setExpandedQueueId(savedExpandedQueueId);
          }
        } catch (error) {
          console.error("Erro ao carregar filas salvas:", error);
        }
      }
      
      // Carregar tarefas ativas
      try {
        const savedTasks = localStorage.getItem('activeTasks');
        if (savedTasks) {
          const tasks = JSON.parse(savedTasks);
          setActiveTasks(tasks);
          
          // Para cada tarefa ativa, verificar o status
          tasks.forEach((task: ActiveTask) => {
            // Verificar se a tarefa ainda é relevante (menos de 24 horas)
            const taskDate = new Date(task.timestamp);
            const now = new Date();
            const hoursDiff = (now.getTime() - taskDate.getTime()) / (1000 * 60 * 60);
            
            if (hoursDiff < 24) {
              // Reiniciar a verificação do status
              checkTaskStatus(task.taskId, task.jobId, task.queueId);
            } else {
              // Se a tarefa é muito antiga, remover da lista e marcar como erro
              setQueues(prev => prev.map(q => 
                q.id === task.queueId 
                  ? { ...q, status: "error" }
                  : q
              ));
              
              // Remover a tarefa da lista
              setActiveTasks(prev => prev.filter(t => t.taskId !== task.taskId));
              localStorage.setItem('activeTasks', JSON.stringify(activeTasks.filter(t => t.taskId !== task.taskId)));
            }
          });
        }
      } catch (error) {
        console.error("Erro ao carregar tarefas ativas:", error);
      }
    }
  }, []);

  // Salvar filas e tarefas ativas no localStorage
  useEffect(() => {
    const userId = getUserIdFromToken();
    if (userId) {
      localStorage.setItem(`conversionQueues_${userId}`, JSON.stringify(queues));
      if (expandedQueueId) {
        localStorage.setItem(`expandedQueueId_${userId}`, expandedQueueId);
      }
    }
  }, [queues, expandedQueueId]);

  // Salvar tarefas ativas no localStorage
  useEffect(() => {
    localStorage.setItem('activeTasks', JSON.stringify(activeTasks));
  }, [activeTasks]);

  // Componente para cada card de fila
  const QueueCard = ({ queue, onFileSelect }: { 
    queue: ConversionQueue; 
    onFileSelect: (queueId: string, files: FileList) => void 
  }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isExpanded = expandedQueueId === queue.id;
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        onFileSelect(queue.id, e.target.files);
      }
    };
    
    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files) {
        onFileSelect(queue.id, e.dataTransfer.files);
      }
    };
    
    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
    };
    
    const toggleExpand = () => {
      setExpandedQueueId(isExpanded ? "" : queue.id);
    };
    
    // Encontrar o arquivo atualmente sendo processado
    const processingFile = queue.files.find(file => file.status === "processing");
    
    return (
      <Card className={cn(
        "transition-all hover:shadow-md",
        isExpanded ? "ring-2 ring-primary" : ""
      )}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2 text-green-500">
                {queue.name}
                <Badge variant={
                  queue.status === "draft" ? "outline" : 
                  queue.status === "processing" ? "secondary" :
                  queue.status === "error" ? "destructive" : "default"
                }>
                  {queue.status === "draft" ? "Não iniciado" :
                   queue.status === "processing" ? (
                     <div className="flex items-center gap-1">
                       <Loader2 className="h-5 w-5 animate-spin text-green-500" />
                       Processando
                     </div>
                   ) : 
                   queue.status === "error" ? "Erro" : "Concluído"}
                </Badge>
              </CardTitle>
              {queue.description && (
                <p className="text-sm text-muted-foreground mt-1">{queue.description}</p>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={toggleExpand}
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {queue.status !== "processing" && (
                    <>
                      <DropdownMenuItem onClick={() => {
                        setQueues(prev => prev.map(q => 
                          q.id === queue.id 
                            ? { ...q, files: [], status: "draft" }
                            : q
                        ));
                        toast.success("Arquivos removidos da fila!");
                      }}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Limpar arquivos
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setQueues(prev => prev.filter(q => q.id !== queue.id));
                        if (expandedQueueId === queue.id) {
                          setExpandedQueueId("");
                        }
                        toast.success("Fila excluída!");
                      }} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir fila
                      </DropdownMenuItem>
                    </>
                  )}
                  {queue.status === "completed" && (
                    <DropdownMenuItem onClick={() => {
                      const conversionData = JSON.parse(localStorage.getItem(`conversionData_${queue.id}`) || '{}');
                      if (conversionData.zipId) {
                        const backendUrl = import.meta.env.VITE_DJANGO_BACKEND_URL;
                        window.open(`${backendUrl}/api/download-zip/${conversionData.zipId}/`, "_blank");
                      }
                    }}>
                      <Download className="mr-2 h-4 w-4" />
                      Baixar resultados
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Barra de status de conversão */}
          {/* {queue.status === "processing" && (
            <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <span className="font-medium text-blue-800">Processando arquivos...</span>
                </div>
                <span className="text-sm font-medium text-blue-700">
                  {queue.files.filter(f => f.status === "completed").length} de {queue.files.length}
                </span>
              </div>
              <Progress 
                value={
                  (queue.files.filter(f => f.status === "completed").length / queue.files.length) * 100
                } 
                className="h-2" 
              />
              {processingFile && (
                <div className="flex items-center text-sm text-blue-700 bg-blue-100 p-2 rounded">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  <span className="truncate">Convertendo: {processingFile.name}</span>
                </div>
              )}
            </div>
          )} */}
          
          {/* Área de upload de arquivos */}
          {queue.status === "draft" && (
            <div
              className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors hover:bg-muted/50"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <Upload className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Arraste arquivos PDF aqui ou clique para selecionar
              </p>
            </div>
          )}
          
          {/* Lista de arquivos (versão compacta) */}
          {!isExpanded && queue.files.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  {queue.files.length} arquivo(s)
                </span>
                {queue.status === "processing" && (
                  <span className="text-xs text-muted-foreground">
                    {queue.files.filter(f => f.status === "completed").length} de {queue.files.length} concluídos
                  </span>
                )}
              </div>
              
              <div className="max-h-32 overflow-y-auto space-y-1">
                {queue.files.slice(0, 3).map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {file.status === "completed" && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      {file.status === "processing" && (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      )}
                    </div>
                  </div>
                ))}
                {queue.files.length > 3 && (
                  <div className="text-center text-xs text-muted-foreground py-1">
                    +{queue.files.length - 3} mais arquivos
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Ações principais */}
          <div className="flex gap-2 pt-2">
            {queue.status === "draft" && queue.files.length > 0 && (
              <Button 
                onClick={() => startConversion(queue.id)}
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" />
                Processar Arquivos
              </Button>
            )}
            
            {queue.status === "processing" && (
              <Button 
                disabled
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processando...
              </Button>
            )}
            
            {queue.status === "error" && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setQueues(prev => prev.map(q => 
                    q.id === queue.id 
                      ? { ...q, status: "draft" }
                      : q
                  ));
                }}
                className="flex-1"
              >
                Tentar Novamente
              </Button>
            )}
            
            {queue.status === "completed" && (
              <Button 
                variant="outline" 
                onClick={() => {
                  const conversionData = JSON.parse(localStorage.getItem(`conversionData_${queue.id}`) || '{}');
                  if (conversionData.zipId) {
                    const backendUrl = import.meta.env.VITE_DJANGO_BACKEND_URL;
                    window.open(`${backendUrl}/api/download-zip/${conversionData.zipId}/`, "_blank");
                  }
                }}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar Resultados
              </Button>
            )}
          </div>
          
          {/* Conteúdo expandido - Detalhes da fila */}
          {isExpanded && (
            <div className="pt-4 border-t space-y-4">
              {/* Informações da fila */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Data de Criação:</span>
                  <p className="text-sm">{queue.createdAt.toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Total de Arquivos:</span>
                  <p className="text-sm">{queue.files.length}</p>
                </div>
              </div>
              
              {/* Lista completa de arquivos */}
              {queue.files.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Arquivos na Fila</h4>
                  <div className="border rounded-lg max-h-60 overflow-y-auto">
                    {queue.files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {file.status === "completed" && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                          {file.status === "processing" && (
                            <div className="flex items-center gap-1 text-blue-600">
                              <Loader2 className="h-5 w-5 animate-spin" />
                              <span className="text-sm">Processando</span>
                            </div>
                          )}
                          {file.status === "error" && (
                            <Badge variant="destructive">Erro</Badge>
                          )}
                          {queue.status === "draft" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setFileToRemove({ queueId: queue.id, fileId: file.id })}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Ações adicionais */}
              <div className="flex gap-2">
                {queue.status !== "processing" && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setQueues(prev => prev.filter(q => q.id !== queue.id));
                      setExpandedQueueId("");
                      toast.success("Fila excluída!");
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Fila
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gerenciamento de Arquivos NFS-e</h1>
          <p className="text-muted-foreground">Organize, processe e baixe seus arquivos de notas fiscais</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 hover:text-green-500">
              <Plus className="w-4 h-4" />
              Nova Fila
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Fila de Conversão</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="queueName">Nome da Fila</Label>
                <Input
                  id="queueName"
                  placeholder="Ex: Empresa X - Contratos"
                  value={newQueueName}
                  onChange={(e) => setNewQueueName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="queueDescription">Descrição (opcional)</Label>
                <Input
                  id="queueDescription"
                  placeholder="Descrição da fila..."
                  value={newQueueDescription}
                  onChange={(e) => setNewQueueDescription(e.target.value)}
                />
              </div>
              <Button onClick={createNewQueue} className="w-full">
                Criar Fila
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Filas */}
      {queues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {queues.map((queue) => (
            <QueueCard 
              key={queue.id} 
              queue={queue} 
              onFileSelect={handleFileSelect}
            />
          ))}
        </div>
      ) : (
        /* Estado vazio */
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderPlus className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma fila criada</h3>
            <p className="text-muted-foreground text-center mb-6">
              Crie sua primeira fila para começar a organizar e processar seus arquivos
            </p>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Fila
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Diálogo de confirmação para remover arquivo */}
      <Dialog open={!!fileToRemove} onOpenChange={(open) => !open && setFileToRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover Arquivo</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja remover este arquivo da fila?
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setFileToRemove(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (fileToRemove) {
                  removeFile(fileToRemove.queueId, fileToRemove.fileId);
                  setFileToRemove(null);
                }
              }}
            >
              Remover
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileUpload;