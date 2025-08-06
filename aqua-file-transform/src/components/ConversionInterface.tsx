// start comment: ConversionInterface.tsx integrando com FileUpload
import { useState, useEffect, useRef } from "react";
import FileUpload from "./FileUpload";  // Ajuste o caminho se precisar
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { callDjangoBackend } from "@/lib/api";
import { toast } from "sonner";


import { 
  Settings, 
  Play, 
  Loader2,
  CheckCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ZAxis } from "recharts";

interface ConversionJob {
  id: string;
  fileName: string;
  outputFormat: string;
  status: "pending" | "processing" | "completed" | "error";
  progress: number;
  downloadUrl?: string;
}

export interface ConversionInterfaceProps {
  onConversionComplete?: (result: { zipUrl?: string; taskId?: string }) => void;
  initialFiles: File[];
}


const ConversionInterface = ({ onConversionComplete, initialFiles }: ConversionInterfaceProps) => {
const [selectedFiles, setSelectedFiles] = useState<File[]>([]);  // agora inicia vazio
const [taskId, setTaskId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedFiles(initialFiles);
  }, [initialFiles]);

  const [selectedFormat, setSelectedFormat] = useState<string>("");
  const [jobs, setJobs] = useState<ConversionJob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const zipUrlRef = useRef<string | null>(null);
  const [buttonText, setButtonText] = useState("Processar Arquivo(s)");

  const outputFormats = [
    { value: "xml", label: "XML ABRASF 1.0 (.xml)" },
    { value: "json", label: "Formato JSON" },
    { value: "excel", label: "Formato Excel (.xlsx)" },

  ];

  // Recebe os arquivos reais do FileUpload
  const handleFileUpload = (files: File[]) => {
    setSelectedFiles(files);
  };

  // useEffect para verificar se todos os jobs estão completos
  useEffect(() => {
  const allCompleted = jobs.length > 0 && jobs.every(job => job.status === "completed");
  if (allCompleted && onConversionComplete && zipUrlRef.current && taskId) {
    onConversionComplete({ zipUrl: zipUrlRef.current, taskId });
  }
  }, 
  [jobs, onConversionComplete, taskId]);

  // Função para baixar o arquivo zip
  const downloadFileWithAuth = async (zipId: string) => {
      const token = localStorage.getItem("access_token");
      const backendUrl = import.meta.env.VITE_DJANGO_BACKEND_URL;
      const response = await fetch(`${backendUrl}/download-zip/${zipId}/`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao baixar o arquivo.");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `arquivo-${zipId}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    };


    // Função para verificar o status da tarefa
    const checkTaskStatus = async (taskId: string, jobId: string) => {
    try {
      const backendUrl = import.meta.env.VITE_DJANGO_BACKEND_URL;
      const token = localStorage.getItem("access_token");

      const response = await fetch(`${backendUrl}/task-status/${taskId}/`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();
      // const audio = new Audio("sounds/notificacao.mp3");
      // audio.play();

      if (data.state === "SUCCESS") {
        const zipUrl = data.meta?.zip_id ? `${backendUrl}/download-zip/${data.meta.zip_id}/` : null;
        if (zipUrl) {
          toast(`Processamento ${taskId} concluído!`, {
          description: "Clique no botão Donwload.",
          duration: Infinity, // <- permanece até o usuário interagir
          action: {
            label: "Download",
            onClick: () => {
              window.open(zipUrl, "_blank");
              // toast.dismiss(); // opcional: fecha o toast após clique
              
            },
          },
        });
        }
      } else if (data.state === "FAILURE") {
        toast.error("Erro ao processar seus arquivos.");
      } else {
        setTimeout(() => checkTaskStatus(taskId, jobId), 3000); // Continua checando
      }
    } catch (err) {
      console.error("Erro ao verificar status:", err);
      toast.error("Erro ao consultar status da tarefa.");
    }
  };

    // End checkTaskStatus
    const startConversion = async () => {
    if (!selectedFormat) {
      alert("Selecione um formato de saída.");
      return;
    }
    if (selectedFiles.length === 0) {
      alert("Nenhum arquivo selecionado.");
      return;
    }

    try {
      toast.info(`Processamento iniciado. Você será notificado quando estiver pronto. Enquanto isso, você pode solicitar novos processamentos.`, {});

      const response = await callDjangoBackend("/upload-e-processar-pdf/", "POST", { output_format: selectedFormat }, selectedFiles);

      const taskId = response?.task_id;
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
    }
  };

  return (
    <Card className="gradient-card shadow-card animate-slide-up" style={{ animationDelay: "200ms" }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Settings className="w-5 h-5" />
          Interface de Conversão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* start comment: Upload de arquivos */}
       {/* <FileUpload onFileUpload={handleFileUpload} /> */}
        {/* end comment */}

        {/* start comment: Seleção de formato e botão */}
        <div className="space-y-4 mt-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Formato de Saída
            </label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Selecione o formato de conversão</option>
              {outputFormats.map((format) => (
                <option key={format.value} value={format.value}>{format.label}</option>
              ))}
            </select>
          </div>

          <Button
            onClick={startConversion}
            disabled={!selectedFormat || isProcessing || selectedFiles.length === 0}
            className="w-full gradient-primary text-primary-foreground hover:scale-105 transition-transform"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                {buttonText}
              </>
            )}
          </Button>
        </div>
        {/* end comment */}

        {/* start comment: Status dos jobs */}
        {jobs.length > 0 && (
          <div className="space-y-4 mt-6">
            <h4 className="font-medium text-foreground">Status das Conversões</h4>
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-lg border bg-card",
                    "animate-scale-in"
                  )}
                >
                  <div className="flex-shrink-0">
                    {job.status === "processing" && <Loader2 className="w-4 h-4 text-secondary animate-spin" />}
                    {job.status === "completed" && <CheckCircle className="w-4 h-4 text-secondary" />}
                    {job.status === "pending" && <Play className="w-4 h-4 text-muted-foreground" />}
                    {job.status === "error" && <X className="w-4 h-4 text-destructive" />}
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm text-foreground">
                        {job.fileName}
                      </p>
                      {/* Badge de status - implemente se quiser */}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>→ {job.outputFormat.toUpperCase()}</span>
                    </div>
                    {job.status === "processing" && <Progress value={job.progress} className="h-1" />}
                  </div>

                  {/* Botão para download */}
                  {/* {job.status === "completed" && job.downloadUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="hover:bg-secondary/10 hover:border-secondary/40"
                      onClick={() => window.open(job.downloadUrl, "_blank")}
                    >
                      Download
                    </Button>
                  )} */}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* end comment */}

      </CardContent>
    </Card>
  );
};

export default ConversionInterface;

// end comment
