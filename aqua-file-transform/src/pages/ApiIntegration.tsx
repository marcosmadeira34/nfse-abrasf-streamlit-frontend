//src/pages/ApiIntegration.tsx
import { useState, useEffect } from "react";
import { 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Eye,
  Download,
  RefreshCw,    
  FileText,
  TrendingUp,
  Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useNavigate } from "react-router-dom";

interface SentFile {
  id: string;
  fileName: string;
  queueName: string;
  status: 'enviando' | 'sucesso' | 'erro' | 'timeout';
  batchId: string;
  sentAt: string;
  responseTime?: number;
  errorMessage?: string;
}

interface SendBatch {
  id: string;
  filesCount: number;
  status: 'enviando' | 'concluido' | 'erro_parcial';
  startedAt: string;
  completedAt?: string;
  successCount: number;
  errorCount: number;
}

const mockSentFiles: SentFile[] = [
  {
    id: '1',
    fileName: 'nota_fiscal_001.xml',
    queueName: 'Fila Empresa X',
    status: 'sucesso',
    batchId: 'batch_001',
    sentAt: '2024-01-15T10:30:00Z',
    responseTime: 1250
  },
  {
    id: '2',
    fileName: 'nota_fiscal_002.xml',
    queueName: 'Fila Empresa X',
    status: 'sucesso',
    batchId: 'batch_001',
    sentAt: '2024-01-15T10:30:05Z',
    responseTime: 980
  },
  {
    id: '3',
    fileName: 'nota_fiscal_003.xml',
    queueName: 'Fila Empresa Y',
    status: 'erro',
    batchId: 'batch_002',
    sentAt: '2024-01-15T11:15:00Z',
    responseTime: 2500,
    errorMessage: 'Dados de CNPJ inválidos'
  }
];

const mockBatches: SendBatch[] = [
  {
    id: 'batch_001',
    filesCount: 5,
    status: 'concluido',
    startedAt: '2024-01-15T10:30:00Z',
    completedAt: '2024-01-15T10:31:30Z',
    successCount: 5,
    errorCount: 0
  },
  {
    id: 'batch_002',
    filesCount: 3,
    status: 'erro_parcial',
    startedAt: '2024-01-15T11:15:00Z',
    completedAt: '2024-01-15T11:17:00Z',
    successCount: 2,
    errorCount: 1
  }
];

const ApiIntegration = () => {
  const [selectedTab, setSelectedTab] = useState("overview");
  const { toast } = useToast();
  const location = useLocation();
  const [sentFiles, setSentFiles] = useState<SentFile[]>([]);
  const [batches, setBatches] = useState<SendBatch[]>([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para pegar o ID do usuário do token JWT
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

  useEffect(() => {
    // Verificar se veio da página de validação
    if (location.state?.sentFiles) {
      setSentFiles(location.state.sentFiles);
      setBatches(location.state.batches || []);
      
      // Salvar os dados de envio no localStorage para persistência
      const userId = getUserIdFromToken();
      if (userId) {
        localStorage.setItem(`apiIntegration_sentFiles_${userId}`, JSON.stringify(location.state.sentFiles));
        localStorage.setItem(`apiIntegration_batches_${userId}`, JSON.stringify(location.state.batches || []));
      }
      
      setLoading(false);
    } else {
      // Tentar carregar do localStorage
      const userId = getUserIdFromToken();
      if (userId) {
        const savedSentFiles = localStorage.getItem(`apiIntegration_sentFiles_${userId}`);
        const savedBatches = localStorage.getItem(`apiIntegration_batches_${userId}`);
        
        if (savedSentFiles) {
          try {
            setSentFiles(JSON.parse(savedSentFiles));
            setBatches(savedBatches ? JSON.parse(savedBatches) : []);
            setLoading(false);
            return;
          } catch (error) {
            console.error("Erro ao carregar dados salvos:", error);
          }
        }
      }
      
      // Se não veio da validação e não há dados salvos, mostrar erro
      setError("Nenhum arquivo enviado para a API. Por favor, valide e envie os XMLs primeiro.");
      setLoading(false);
    }
  }, [location]);

  // Adicionar useEffect para salvar os dados quando eles mudam
  useEffect(() => {
    if (sentFiles.length > 0) {
      const userId = getUserIdFromToken();
      if (userId) {
        localStorage.setItem(`apiIntegration_sentFiles_${userId}`, JSON.stringify(sentFiles));
        localStorage.setItem(`apiIntegration_batches_${userId}`, JSON.stringify(batches));
      }
    }
  }, [sentFiles, batches]);


  

// Adicionar função para simular o envio real para API
const sendToExternalApi = async (files: SentFile[]) => {
  // Em um cenário real, você faria uma requisição real para a API externa
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1500);
  });
};





  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sucesso':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'enviando':
        return <Clock className="w-4 h-4 text-warning animate-spin" />;
      case 'erro':
      case 'timeout':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sucesso':
      case 'concluido':
        return <Badge variant="secondary" className="bg-success/10 text-success border-success/20">Sucesso</Badge>;
      case 'enviando':
        return <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">Enviando</Badge>;
      case 'erro':
      case 'timeout':
        return <Badge variant="destructive">Erro</Badge>;
      case 'erro_parcial':
        return <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 border-orange-500/20">Parcial</Badge>;
      default:
        return null;
    }
  };

  const formatDuration = (ms: number) => {
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const totalFiles = sentFiles.length;
  const successFiles = sentFiles.filter(f => f.status === 'sucesso').length;
  const errorFiles = sentFiles.filter(f => f.status === 'erro' || f.status === 'timeout').length;
  const avgResponseTime = sentFiles.length > 0 ? 
    Math.round(sentFiles.reduce((acc, f) => acc + (f.responseTime || 0), 0) / sentFiles.length) : 0;

  const handleResendFile = async (fileId: string) => {
  setSentFiles(files => 
    files.map(file => 
      file.id === fileId 
        ? { ...file, status: 'enviando' }
        : file
    )
  );
  
  try {
    // Simular reenvio
    await sendToExternalApi(sentFiles.filter(f => f.id === fileId));
    
    setSentFiles(files => 
      files.map(file => 
        file.id === fileId 
          ? { 
              ...file, 
              status: Math.random() > 0.3 ? 'sucesso' : 'erro',
              sentAt: new Date().toISOString(),
              responseTime: Math.floor(Math.random() * 2000) + 500
            }
          : file
      )
    );
    
    toast({
      title: "Arquivo reenviado",
      description: "O arquivo foi processado novamente."
    });
  } catch (error) {
    console.error("Erro ao reenviar arquivo:", error);
    toast({
      title: "Erro",
      description: "Erro ao reenviar o arquivo",
      variant: "destructive"
    });
    
    setSentFiles(files => 
      files.map(file => 
        file.id === fileId 
          ? { ...file, status: 'erro', errorMessage: 'Erro ao reenviar arquivo' }
          : file
      )
    );
  }
};

  // Adicionar botão para voltar à validação
  const handleBackToValidation = () => {
    navigate('/xml-validation');
  };
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Integração com API
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe o status dos arquivos enviados para a API externa
          </p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Relatório de Envios
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Enviados</p>
                <p className="text-2xl font-bold">{totalFiles}</p>
              </div>
              <Send className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sucessos</p>
                <p className="text-2xl font-bold text-success">{successFiles}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Erros</p>
                <p className="text-2xl font-bold text-destructive">{errorFiles}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tempo Médio</p>
                <p className="text-2xl font-bold">{formatDuration(avgResponseTime)}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Envios</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="files">Arquivos Individuais</TabsTrigger>
              <TabsTrigger value="batches">Lotes de Envio</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Success Rate */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-8 h-8 text-success" />
                      <div>
                        <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                        <p className="text-2xl font-bold">
                          {totalFiles > 0 ? Math.round((successFiles / totalFiles) * 100) : 0}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Last Activity */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Activity className="w-8 h-8 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Último Envio</p>
                        <p className="text-sm font-medium">
                          {sentFiles.length > 0 ? 
                            formatDate(sentFiles[sentFiles.length - 1].sentAt) : 
                            'Nenhum envio'
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Files */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Arquivos Recentes</h3>
                <div className="space-y-2">
                  {sentFiles.slice(-5).reverse().map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-primary" />
                        <div>
                          <p className="font-medium text-sm">{file.fileName}</p>
                          <p className="text-xs text-muted-foreground">{file.queueName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {file.responseTime && (
                          <span className="text-xs text-muted-foreground">
                            {formatDuration(file.responseTime)}
                          </span>
                        )}
                        {getStatusBadge(file.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="files" className="space-y-4">
              <div className="space-y-3">
                {sentFiles.map((file) => (
                  <div key={file.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(file.status)}
                        <div>
                          <p className="font-medium">{file.fileName}</p>
                          <p className="text-sm text-muted-foreground">{file.queueName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {file.responseTime && (
                          <span className="text-sm text-muted-foreground">
                            {formatDuration(file.responseTime)}
                          </span>
                        )}
                        {getStatusBadge(file.status)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Lote: {file.batchId}</span>
                      <span>Enviado: {formatDate(file.sentAt)}</span>
                    </div>
                    
                    {file.errorMessage && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          {file.errorMessage}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3 mr-1" />
                        Ver Detalhes
                      </Button>
                      {file.status === 'erro' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleResendFile(file.id)}
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Reenviar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="batches" className="space-y-4">
              <div className="space-y-3">
                {batches.map((batch) => (
                  <div key={batch.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Lote {batch.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {batch.filesCount} arquivo(s)
                        </p>
                      </div>
                      {getStatusBadge(batch.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Sucessos: </span>
                        <span className="font-medium text-success">{batch.successCount}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Erros: </span>
                        <span className="font-medium text-destructive">{batch.errorCount}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Iniciado: {formatDate(batch.startedAt)}</span>
                      {batch.completedAt && (
                        <span>Concluído: {formatDate(batch.completedAt)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiIntegration;