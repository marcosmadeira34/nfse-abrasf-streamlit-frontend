//src/components/FileUpload.tsx
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, X, CheckCircle, Plus, FolderPlus, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { callDjangoBackend } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { v4 as uuidv4} from "uuid";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  file: File;
  status: "uploading" | "completed" | "error";
  progress: number;
}

interface ConversionQueue {
  id: string;
  name: string;
  description: string;
  files: UploadedFile[];
  createdAt: Date;
  status: "draft" | "processing" | "completed";
}

interface FileUploadProps {
  onQueueComplete?: (queue: ConversionQueue) => void;
}

const FileUpload = ({ onQueueComplete }: FileUploadProps) => {
  const [queues, setQueues] = useState<ConversionQueue[]>([]);
  const [selectedQueueId, setSelectedQueueId] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newQueueName, setNewQueueName] = useState("");
  const [newQueueDescription, setNewQueueDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileToRemove, setFileToRemove] = useState<{ queueId: string; fileId: string } | null>(null);
  const navigate = useNavigate();
  const [selectedFormat, setSelectedFormat] = useState<string>("");
  // const [selectedFiles, setSelectedFiles] = useState<File[]>([]);  // agora inicia vazio
  const [buttonText, setButtonText] = useState("Processar Arquivo(s)");

  const outputFormats = [
    { value: "xml", label: "XML ABRASF 1.0 (.xml)" },
    { value: "json", label: "Formato JSON" },
    { value: "excel", label: "Formato Excel (.xlsx)" },

  ];



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
      id: generateUUID(),
      name: newQueueName,
      description: newQueueDescription,
      files: [],
      createdAt: new Date(),
      status: "draft"
    };

    setQueues(prev => [...prev, newQueue]);
    setSelectedQueueId(newQueue.id);
    setNewQueueName("");
    setNewQueueDescription("");
    setIsCreateDialogOpen(false);
  };

  const simulateUpload = (queueId: string, fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
      progress = 100;

      let fileName = ""; // Aqui vamos armazenar o nome do arquivo

      setQueues(prev => prev.map(q => {
        if (q.id === queueId) {
          const updatedFiles = q.files.map(f => {
            if (f.id === fileId) {
              fileName = f.name; // Captura o nome do arquivo aqui
              return { ...f, status: "completed" as const, progress: 100 };
            }
            return f;
          });

          return { ...q, files: updatedFiles };
        }
        return q;
      }));

      // console.log(`Upload simulado concluído para "${fileName}" na fila ${queueId}`);

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

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles || !selectedQueueId) return;

    const newFiles: UploadedFile[] = Array.from(selectedFiles).map(file => ({
      id: generateUUID(),
      name: file.name,
      size: file.size,
      file,
      status: "uploading",
      progress: 0
    }));

    setQueues(prev => prev.map(q => 
      q.id === selectedQueueId 
        ? { ...q, files: [...q.files, ...newFiles] }
        : q
    ));

    newFiles.forEach(file => simulateUpload(selectedQueueId, file.id));
  };

  const removeFile = (queueId: string, fileId: string) => {
    setQueues(prev => prev.map(q => 
      q.id === queueId 
        ? { ...q, files: q.files.filter(f => f.id !== fileId) }
        : q
    ));
  };

  const startConversion = async () => {
    const defaultFormat = "xml"; // Define XML ABRASF 1.0 como padrão
    const selectedQueue = queues.find(q => q.id === selectedQueueId);
    
    if (!selectedQueue || selectedQueue.files.length === 0) {
      alert("Nenhum arquivo na fila selecionada.");
      return;
    }

    // Marca a fila como processando
    setQueues(prev => prev.map(q => 
      q.id === selectedQueueId 
        ? { ...q, status: "processing" }
        : q
    ));
  
      try {
        toast.info(`Processamento da fila ${selectedQueue.name} iniciado.`, {});

        const filesToSend = selectedQueue.files.map(f => f.file); // <- arquivos reais aqui!

        const response = await callDjangoBackend("/api/upload-e-processar-pdf/", "POST", { output_format: selectedFormat || defaultFormat }, filesToSend);

        const taskId = response?.task_id;
        // console.log("Task ID recebido:", taskId);
        const jobId = Math.random().toString(36).substr(2, 9); // Só para gerenciar internamente
        setButtonText("Solicitação enviada para IA ");
        
  
        if (taskId) {
          // Checa em background
          checkTaskStatus(taskId, jobId);
        } else {
          toast.error("Erro ao iniciar o processamento.");
        }
  
      } catch (error) {
        console.error("Erro na conversão:", error);
        toast.error("Erro ao processar arquivos.");
        // para atualizar o status da fila
        setQueues(prev => prev.map(q => 
            q.id === selectedQueueId 
                ? { ...q, status: "draft" }
                : q
        ));
      }
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

  const selectedQueue = queues.find(q => q.id === selectedQueueId);
  
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Função para verificar o status da tarefa
  const checkTaskStatus = async (taskId: string, jobId: string) => {
  try {
    const backendUrl = import.meta.env.VITE_DJANGO_BACKEND_URL;
    const token = localStorage.getItem("access_token");
    

    if (!token) {
      console.error("Token não encontrado no localStorage");
      toast.error("Sessão expirada. Faça login novamente.");
      return;
    }
    const url_response = `${backendUrl}/api/task-status/${taskId}/`;
    // console.log("URL da requisição:", url_response);
    // console.log("Token sendo enviado na requisição", token)

    const response = await fetch(url_response, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    // console.log("Response status:", response.status);
    // console.log("Content-Type:", response.headers.get("content-type"));

    if (!response.ok) {
      const text = await response.text();
      console.error("Erro ao verificar status. Resposta bruta:", text);
      console.error("Status da resposta:", response.statusText);
      return;
    }


    const contentType = response.headers.get("content-type");
    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
      // console.log("Dados recebidos:", data);
    } else {
      const text = await response.text();
      console.error("Resposta não é JSON:", text);
      // Adicione este bloco para atualizar o status da fila
      setQueues(prev => prev.map(q => 
          q.id === selectedQueueId 
              ? { ...q, status: "draft" }
              : q
      ));
      return;
    }
    
    if (data.state === "SUCCESS") {
      const zipUrl = data.meta?.zip_id ? `${backendUrl}/api/download-zip/${data.meta.zip_id}/` : null;
      // console.log("Zip URL:", zipUrl);

      // ✅ Atualiza o status da fila
      setQueues(prev =>
        prev.map(q =>
          q.id === selectedQueueId
            ? { ...q, status: "completed" }
            : q
        )
      );
      
      if (zipUrl) {
        // Mostrar toast apenas com opção de download
        toast(`Processamento da fila ${selectedQueue.name} concluído com sucesso!`, {
          description: "Os arquivos convertidos já foram enviados para validação. Clique em Download para baixar o arquivo.",
          duration: Infinity,
          action: (
            <Button
              size="sm"
              onClick={() => {
                window.open(zipUrl, "_blank");
                toast.dismiss(); // Fecha o toast após o download
              }}
            >
              Download
            </Button>
          ),
        });
        
        // Salvar os dados da conversão para persistência
        const conversionData = {
          taskId,
          zipId: data.meta.zip_id,
          queueName: selectedQueue?.name,
          queueId: selectedQueueId,
          xmlData: data.meta.arquivos_resultado,
          timestamp: new Date().toISOString()
        };
        
        // Salvar no localStorage
        localStorage.setItem(`conversionData_${selectedQueueId}`, JSON.stringify(conversionData));


        // Crie um array de XmlData já estruturado para salvar também:
        const userId = getUserIdFromToken();
        // console.log("UserId para salvar localStorage:", userId);
        
        const xmlFiles = Object.entries(data.meta.arquivos_resultado).map(([fileName, content]) => ({
          id: generateUUID(),
          fileName,
          queueName: selectedQueue?.name || "Fila Desconhecida",
          xmlContent: { content },
          validationStatus: 'pendente',
          anomalies: [],
          createdAt: new Date().toISOString(),
        }));

        localStorage.setItem(`xmlFiles_${userId}_${selectedQueueId}`, JSON.stringify(xmlFiles));

        // Redirecionar automaticamente para a validação com os dados
        // navigate('/xml-validation', { 
        //   state: { 
        //     taskId, 
        //     zipId: data.meta.zip_id,
        //     queueName: selectedQueue?.name,
        //     queueId: selectedQueueId,
        //     xmlData: data.meta.arquivos_resultado
        //   }
        // });
      }
      
      // console.log("Processamento concluído:", data);
    } else if (data.state === "FAILURE") {
      toast.error("Erro ao processar seus arquivos.");
      // Adicione este bloco para atualizar o status da fila
      setQueues(prev => prev.map(q => 
          q.id === selectedQueueId 
              ? { ...q, status: "draft" }
              : q
      ));
    } else {
      setTimeout(() => checkTaskStatus(taskId, jobId), 3000);
    }
  } catch (err) {
    console.error("Erro ao verificar status em fila", err);
    toast.error("Erro ao consultar status da tarefa.");
    // Adicione este bloco para atualizar o status da fila
    setQueues(prev => prev.map(q => 
        q.id === selectedQueueId 
            ? { ...q, status: "draft" }
            : q
    ));
  }
};

  
  // Função para pegar o ID do usuário do token JWT
  function getUserIdFromToken() {
    const token = localStorage.getItem("access_token");
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1])); // decodifica o payload do JWT
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
  
  // Limpar dados de conversão antigos
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




  // Leitura inicial das filas salvas no localStorage (por usuário)
  useEffect(() => {
  const userId = getUserIdFromToken();
  if (userId) {
    const savedQueues = localStorage.getItem(`conversionQueues_${userId}`);
    if (savedQueues) {
      try {
        const parsed = JSON.parse(savedQueues);
        parsed.forEach((q: any) => {
          // Restaurar a data corretamente
          q.createdAt = new Date(q.createdAt);
          // Garantir que o status seja válido
          if (!["draft", "processing", "completed"].includes(q.status)) {
            q.status = "draft";
          }
        });
        setQueues(parsed);
        
        // Se houver uma fila selecionada salva, restaurá-la
        const savedSelectedQueueId = localStorage.getItem(`selectedQueueId_${userId}`);
        if (savedSelectedQueueId && parsed.some((q: any) => q.id === savedSelectedQueueId)) {
          setSelectedQueueId(savedSelectedQueueId);
        }
      } catch (error) {
        console.error("Erro ao carregar filas salvas:", error);
      }
    }
  }
}, []);


  useEffect(() => {
  const userId = getUserIdFromToken();
  if (userId) {
    localStorage.setItem(`conversionQueues_${userId}`, JSON.stringify(queues));
    if (selectedQueueId) {
      localStorage.setItem(`selectedQueueId_${userId}`, selectedQueueId);
    }
  }
}, [queues, selectedQueueId]);


  return (
    <Card className="gradient-card shadow-card animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          {/* <FolderPlus className="w-5 h-5" /> */}
          {/* Gerenciamento de Filas de  */}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Queue Management */}
        <div className="flex gap-3">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
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

          {queues.length > 0 && (
            <Select value={selectedQueueId} onValueChange={setSelectedQueueId}>
              <SelectTrigger className="w-64">
          <SelectValue placeholder="Selecionar fila..." />
              </SelectTrigger>
              <SelectContent>
          {queues.map((queue) => (
            <SelectItem key={queue.id} value={queue.id}>
              <div className="flex items-center gap-2">
                <span>{queue.name}</span>
                <Badge variant={queue.status === "draft" ? "outline" : queue.status === "processing" ? "secondary" : "default"}>
            {queue.files.length} arquivos
                </Badge>
              </div>
            </SelectItem>
          ))}
              </SelectContent>
            </Select>
          )}

          {selectedQueueId && (
            <Button 
              variant="destructive" 
              className="flex items-center gap-2"
              onClick={() => {
          setQueues(prev => prev.map(q => 
            q.id === selectedQueueId 
              ? { ...q, files: [], status: "draft" as const }
              : q
          ));
          toast.success("Fila limpa com sucesso!");
              }}
            >
              <X className="w-4 h-4" />
              Limpar Fila
            </Button>
          )}

          {/* Excluir Fila */}
          {selectedQueueId && (
            <Button 
              variant="destructive" 
              className="flex items-center gap-2"
              onClick={() => {
                setQueues(prev => prev.filter(q => q.id !== selectedQueueId));
                setSelectedQueueId("");
                toast.success("Fila excluída com sucesso!");
              }}
            >
              <X className="w-4 h-4" />
              Excluir Fila
            </Button>
          )}
        </div>



        {/* File Upload Area */}
        {selectedQueueId && (
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
                  Adicionar PDFs de NFS na fila: {selectedQueue?.name}
                </h3>
                <p className="text-muted-foreground">
                  Arraste aqui ou clique para adicionar
                </p>
              </div>
              
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="gradient-primary text-primary-foreground hover:scale-105 transition-transform"
                disabled={selectedQueue?.status !== "draft"}
              >
                Adicionar
              </Button>
            </div>
          </div>
        )}

        {!selectedQueueId && queues.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <FolderPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Crie uma nova fila para começar a adicionar arquivos</p>
          </div>
        )}

        {!selectedQueueId && queues.length > 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Upload className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Selecione uma fila para adicionar arquivos</p>
          </div>
        )}

        {/* Queue Details */}
        {selectedQueue && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Fila Selecionada: {selectedQueue.name}</h4>
                {selectedQueue.description && (
                  <p className="text-sm text-muted-foreground">{selectedQueue.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
          <Badge variant={
            selectedQueue.status === "draft" ? "outline" : 
            selectedQueue.status === "processing" ? "secondary" : "default"
          }>
            {selectedQueue.status === "draft" ? "Conversão não iniciada" :
             selectedQueue.status === "processing" ? (
               <div className="flex items-center gap-1">
                 <Loader2 className="w-4 h-4 animate-spin" />
                 Processando
               </div>
             ) : selectedQueue.status === "completed" ? "Concluída" : ""}
          </Badge>
                {selectedQueue.files.length > 0 && selectedQueue.status === "draft" && (
                  <Button 
                    onClick={() => startConversion()}
                    className="flex items-center gap-2"
                    variant="success"
                  >
                    <Send className="w-4 h-4" />
                    Iniciar Conversão
                  </Button>
                )}
              </div>
            </div>

            {selectedQueue.files.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {selectedQueue.files.length} arquivo(s) na fila
                </p>
                {selectedQueue.files.map((file, index) => (
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
                      
                      {selectedQueue.status === "draft" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setFileToRemove({ queueId: selectedQueue.id, fileId: file.id })}
                          className="h-6 w-6 p-0 hover:bg-destructive/10"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* end comment: Queue Details */}
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

        {/* Queues List */}
        {queues.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Filas Criadas</h4>
            <div className="grid gap-3">
              {queues
              .filter(queue => queue.status === "draft") // Exclui filas concluídas
              .map((queue) => (
                <div
                  key={queue.id}
                  className={cn(
                    "p-3 border rounded-lg cursor-pointer transition-all",
                    selectedQueueId === queue.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                  )}
                  onClick={() => setSelectedQueueId(queue.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{queue.name}</p>
                      {queue.description && (
                        <p className="text-xs text-muted-foreground">{queue.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {queue.files.length} arquivos
                      </Badge>
                      {/* <Badge variant={
                        queue.status === "draft" ? "outline" : 
                        queue.status === "processing" ? "secondary" : "default"
                      } className="text-xs">
                        {queue.status === "draft" ? "Rascunho" :
                         queue.status === "processing" ? "Processando" : "Concluída"}
                      </Badge> */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUpload;

// O fluxo deve ser o seguinte. O usuario cria as filas, adiciona os arquivos em cada fila e pede para processar. Um toast informando que o Processo começou é dispara. Apos o toast voltar informando que o processo foi concluído, o status de Processando deve ser alterado para concluído  e posteriormente na página 'conversion', disponibilizar as informaçoes do processamento. Veja como esta meu arquivo Upload