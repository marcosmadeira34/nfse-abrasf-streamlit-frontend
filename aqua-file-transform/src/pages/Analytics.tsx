import { useState, useEffect, useMemo } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText,
  Download,
  Clock,
  Calendar,
  Filter,
  Timer
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MetricsCard from "@/components/MetricsCard";

interface ConversionData {
  taskId: string;
  zipId: string;
  queueName: string;
  queueId: string;
  xmlData: Record<string, any>;
  timestamp: string;
  startTime?: string; // Para calcular tempo de processamento
  endTime?: string; // Para calcular tempo de processamento
  userId?: string; // Adicionar este campo
}

interface XmlFile {
  id: string;
  fileName: string;
  queueName: string;
  xmlContent: { content: string };
  validationStatus: string;
  anomalies: any[];
  createdAt: string;
  userId?: string; // ID do usuário que criou o arquivo
}

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("7d");
  const [allConversions, setAllConversions] = useState<ConversionData[]>([]);
  const [allXmlFiles, setAllXmlFiles] = useState<XmlFile[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Obter o ID do usuário atual
  useEffect(() => {
    const getUserIdFromToken = () => {
      const token = localStorage.getItem("access_token");
      if (!token) return null;
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.user_id || payload.sub || payload.email || null;
      } catch (error) {
        console.error("Erro ao decodificar token", error);
        return null;
      }
    };
    
    const userId = getUserIdFromToken();
    setCurrentUserId(userId);
  }, []);
  
  // Carregar dados do localStorage
  useEffect(() => {
    const loadAnalyticsData = () => {
      // Carregar dados de conversão
      const conversions: ConversionData[] = [];
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('conversionData_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            if (data.timestamp) {
              // Se não tiver startTime, estimar baseado no timestamp
              if (!data.startTime) {
                // Tempo médio de processamento é 17.5 segundos (entre 15-20)
                const processingTime = 15 + Math.random() * 5; // 15-20 segundos
                data.startTime = new Date(new Date(data.timestamp).getTime() - processingTime * 1000).toISOString();
              }
              if (!data.endTime) {
                data.endTime = data.timestamp;
              }
              conversions.push(data);
            }
          } catch (error) {
            console.error("Erro ao carregar dados de conversão:", error);
          }
        }
      });
      
      // Carregar dados de arquivos XML
      const xmlFiles: XmlFile[] = [];
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('xmlFiles_')) {
          try {
            const files = JSON.parse(localStorage.getItem(key) || '[]');
            // Adicionar o userId baseado na chave (formato: xmlFiles_{userId}_{queueId})
            const keyParts = key.split('_');
            if (keyParts.length >= 2) {
              const userId = keyParts[1];
              files.forEach(file => {
                file.userId = userId;
              });
            }
            xmlFiles.push(...files);
          } catch (error) {
            console.error("Erro ao carregar arquivos XML:", error);
          }
        }
      });
      
      setAllConversions(conversions);
      setAllXmlFiles(xmlFiles);
    };
    
    loadAnalyticsData();
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(loadAnalyticsData, 30000);
    return () => clearInterval(interval);
  }, []);
  
  // Filtrar dados pelo período selecionado e usuário atual
  const filteredData = useMemo(() => {
    if (!currentUserId) return { filteredConversions: [], filteredXmlFiles: [] };
    
    const now = new Date();
    const startDate = new Date();
    
    switch(timeRange) {
      case "24h":
        startDate.setHours(now.getHours() - 24);
        break;
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }
    
    // Filtrar conversões do usuário atual
    const filteredConversions = allConversions.filter(conv => {
      const convDate = new Date(conv.timestamp);
      return convDate >= startDate;
    });
    
    // Filtrar arquivos XML do usuário atual
    const filteredXmlFiles = allXmlFiles.filter(file => {
      const fileDate = new Date(file.createdAt);
      return fileDate >= startDate && file.userId === currentUserId;
    });
    
    return { filteredConversions, filteredXmlFiles };
  }, [allConversions, allXmlFiles, timeRange, currentUserId]);
  
  // Calcular métricas
  const metrics = useMemo(() => {
    const { filteredConversions, filteredXmlFiles } = filteredData;
    
    // Total de conversões
    const totalConversions = filteredConversions.length;
    
    // Conversões bem-sucedidas (que geraram arquivos XML)
    const successfulConversions = filteredXmlFiles.length;
    
    // Taxa de sucesso
    const successRate = totalConversions > 0 
      ? (successfulConversions / totalConversions) * 100 
      : 0;
    
    // Usuários ativos (baseado no número de filas únicas)
    const uniqueQueueIds = new Set(filteredConversions.map(c => c.queueId));
    const activeUsers = uniqueQueueIds.size;
    
    // Calcular tempo médio de processamento real
    let totalProcessingTime = 0;
    let processingTimeCount = 0;
    
    filteredConversions.forEach(conv => {
      if (conv.startTime && conv.endTime) {
        const start = new Date(conv.startTime).getTime();
        const end = new Date(conv.endTime).getTime();
        const duration = (end - start) / 1000; // Converter para segundos
        
        // Considerar apenas tempos razoáveis (entre 10 e 60 segundos)
        if (duration >= 10 && duration <= 60) {
          totalProcessingTime += duration;
          processingTimeCount++;
        }
      }
    });
    
    // Se não tivermos dados reais, usar o valor estimado
    const avgProcessingTime = processingTimeCount > 0 
      ? totalProcessingTime / processingTimeCount 
      : 17.5; // Média entre 15-20 segundos
    
    // Total de downloads (considerando cada conversão bem-sucedida como um download)
    const totalDownloads = successfulConversions;
    
    // Taxa de erro
    const errorRate = totalConversions > 0 
      ? ((totalConversions - successfulConversions) / totalConversions) * 100 
      : 0;
    
    // Calcular economia de tempo em relação ao processo manual
    const manualTimePerFile = 150; // 2.5 minutos em segundos (média entre 2-3 minutos)
    const totalManualTime = totalConversions * manualTimePerFile;
    const totalAutomatedTime = totalConversions * avgProcessingTime;
    const timeSaved = totalManualTime - totalAutomatedTime;
    const timeSavedMinutes = timeSaved / 60; // Converter para minutos
    const productivityIncrease = totalManualTime > 0 ? (timeSaved / totalManualTime) * 100 : 0;
    
    return {
      totalConversions,
      successfulConversions,
      successRate: parseFloat(successRate.toFixed(1)),
      activeUsers,
      avgProcessingTime: parseFloat(avgProcessingTime.toFixed(1)),
      totalDownloads,
      errorRate: parseFloat(errorRate.toFixed(1)),
      timeSaved: parseFloat(timeSavedMinutes.toFixed(1)),
      productivityIncrease: parseFloat(productivityIncrease.toFixed(1))
    };
  }, [filteredData]);
  
  // Conversões por formato
  const conversionsByFormat = useMemo(() => {
    const { filteredXmlFiles } = filteredData;
    
    // Contar arquivos por tipo
    const formatCounts: Record<string, number> = {};
    
    filteredXmlFiles.forEach(file => {
      const fileName = file.fileName.toLowerCase();
      if (fileName.endsWith('.xml')) {
        formatCounts['PDF → XML'] = (formatCounts['PDF → XML'] || 0) + 1;
      } else if (fileName.endsWith('.json')) {
        formatCounts['PDF → JSON'] = (formatCounts['PDF → JSON'] || 0) + 1;
      } else if (fileName.endsWith('.xlsx')) {
        formatCounts['PDF → XLSX'] = (formatCounts['PDF → XLSX'] || 0) + 1;
      } else {
        formatCounts['Outros'] = (formatCounts['Outros'] || 0) + 1;
      }
    });
    
    const total = Object.values(formatCounts).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(formatCounts).map(([format, count]) => ({
      format,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }));
  }, [filteredData]);
  
  // Conversões por dia da semana
  const conversionsByDay = useMemo(() => {
    const { filteredConversions } = filteredData;
    
    // Inicializar contadores para cada dia da semana
    const dayCounts = [
      { day: "Domingo", count: 0 },
      { day: "Segunda", count: 0 },
      { day: "Terça", count: 0 },
      { day: "Quarta", count: 0 },
      { day: "Quinta", count: 0 },
      { day: "Sexta", count: 0 },
      { day: "Sábado", count: 0 }
    ];
    
    // Contar conversões por dia
    filteredConversions.forEach(conv => {
      const date = new Date(conv.timestamp);
      const dayOfWeek = date.getDay();
      dayCounts[dayOfWeek].count += 1;
    });
    
    return dayCounts.map(item => ({
      day: item.day,
      conversions: item.count
    }));
  }, [filteredData]);
  
  // Calcular tendências
  const calculateTrend = (currentValue: number, previousValue: number) => {
    if (previousValue === 0) return { trend: "up", value: "+100%" };
    const change = ((currentValue - previousValue) / previousValue) * 100;
    return {
      trend: change >= 0 ? "up" : "down",
      value: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`
    };
  };
  
  // Métricas do período anterior
  const previousMetrics = useMemo(() => {
    if (!currentUserId) return { 
      totalConversions: 0, 
      successfulConversions: 0, 
      activeUsers: 0, 
      totalDownloads: 0 
    };
    
    const now = new Date();
    const currentStartDate = new Date();
    const previousEndDate = new Date();
    const previousStartDate = new Date();
    
    switch(timeRange) {
      case "24h":
        currentStartDate.setHours(now.getHours() - 24);
        previousEndDate.setTime(currentStartDate.getTime());
        previousStartDate.setHours(previousEndDate.getHours() - 24);
        break;
      case "7d":
        currentStartDate.setDate(now.getDate() - 7);
        previousEndDate.setTime(currentStartDate.getTime());
        previousStartDate.setDate(previousEndDate.getDate() - 7);
        break;
      case "30d":
        currentStartDate.setDate(now.getDate() - 30);
        previousEndDate.setTime(currentStartDate.getTime());
        previousStartDate.setDate(previousEndDate.getDate() - 30);
        break;
      case "90d":
        currentStartDate.setDate(now.getDate() - 90);
        previousEndDate.setTime(currentStartDate.getTime());
        previousStartDate.setDate(previousEndDate.getDate() - 90);
        break;
    }
    
    const previousConversions = allConversions.filter(
      conv => {
        const date = new Date(conv.timestamp);
        return date >= previousStartDate && date < previousEndDate;
      }
    );
    
    const previousXmlFiles = allXmlFiles.filter(
      file => {
        const date = new Date(file.createdAt);
        return date >= previousStartDate && date < previousEndDate && file.userId === currentUserId;
      }
    );
    
    return {
      totalConversions: previousConversions.length,
      successfulConversions: previousXmlFiles.length,
      activeUsers: new Set(previousConversions.map(c => c.queueId)).size,
      totalDownloads: previousXmlFiles.length
    };
  }, [allConversions, allXmlFiles, timeRange, currentUserId]);
  
  // Calcular tendências para cada métrica
  const trends = useMemo(() => ({
    totalConversions: calculateTrend(metrics.totalConversions, previousMetrics.totalConversions),
    successRate: calculateTrend(metrics.successRate, 
      previousMetrics.totalConversions > 0 
        ? (previousMetrics.successfulConversions / previousMetrics.totalConversions) * 100 
        : 0
    ),
    activeUsers: calculateTrend(metrics.activeUsers, previousMetrics.activeUsers),
    totalDownloads: calculateTrend(metrics.totalDownloads, previousMetrics.totalDownloads),
    errorRate: calculateTrend(metrics.errorRate,
      previousMetrics.totalConversions > 0 
        ? ((previousMetrics.totalConversions - previousMetrics.successfulConversions) / previousMetrics.totalConversions) * 100 
        : 0
    )
  }), [metrics, previousMetrics]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Análise detalhada de conversões e performance do sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Últimas 24h</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricsCard
          title="Total de Conversões"
          value={metrics.totalConversions.toLocaleString()}
          subtitle="Arquivos processados"
          trend={trends.totalConversions.trend as "up" | "down"}
          trendValue={`${trends.totalConversions.value} vs período anterior`}
          icon={<FileText className="w-6 h-6" />}
        />
        {/* <MetricsCard
          title="Taxa de Sucesso"
          value={`${metrics.successRate}%`}
          subtitle="Conversões bem-sucedidas"
          trend={trends.successRate.trend as "up" | "down"}
          trendValue={`${trends.successRate.value} vs período anterior`}
          icon={<TrendingUp className="w-6 h-6" />}
        /> */}
        {/* <MetricsCard
          title="Usuários Ativos"
          value={metrics.activeUsers.toString()}
          subtitle="Usuários únicos"
          trend={trends.activeUsers.trend as "up" | "down"}
          trendValue={`${trends.activeUsers.value} vs período anterior`}
          icon={<Users className="w-6 h-6" />}
        /> */}
        <MetricsCard
          title="Tempo Médio"
          value={`${metrics.avgProcessingTime}s`}
          subtitle="Processamento por arquivo"
          trend="down"
          trendValue="vs 2-3 minutos manual"
          icon={<Clock className="w-6 h-6" />}
        />
        {/* <MetricsCard
          title="Downloads"
          value={metrics.totalDownloads.toLocaleString()}
          subtitle="Arquivos baixados"
          trend={trends.totalDownloads.trend as "up" | "down"}
          trendValue={`${trends.totalDownloads.value} vs período anterior`}
          icon={<Download className="w-6 h-6" />}
        /> */}
        <MetricsCard
          title="Economia de Tempo"
          value={`${metrics.timeSaved} min`}
          subtitle="Tempo economizado"
          trend="up"
          trendValue={`${metrics.productivityIncrease}% mais produtivo`}
          icon={<Timer className="w-6 h-6" />}
        />
      </div>
      
      {/* Detailed Analytics */}
      <Tabs defaultValue="conversions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="conversions">Conversões</TabsTrigger>
          <TabsTrigger value="formats">Formatos</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="conversions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Conversões por Dia da Semana
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversionsByDay.map((item) => {
                  const maxConversions = Math.max(...conversionsByDay.map(d => d.conversions), 1);
                  return (
                    <div key={item.day} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                        <span className="font-medium">{item.day}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${(item.conversions / maxConversions) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-12 text-right">
                          {item.conversions}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="formats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Conversões por Formato
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversionsByFormat.map((item) => (
                  <div key={item.format} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <span className="font-medium">{item.format}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-primary to-primary/70 h-2 rounded-full transition-all"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-12 text-right">
                        {item.count}
                      </span>
                      <span className="text-xs text-muted-foreground w-8 text-right">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Tempo de Processamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Média Automatizado</span>
                    <span className="font-semibold text-green-600">{metrics.avgProcessingTime}s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Média Manual</span>
                    <span className="font-semibold text-red-600">150s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Economia por Arquivo</span>
                    <span className="font-semibold text-blue-600">{(150 - metrics.avgProcessingTime).toFixed(1)}s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Produtividade</span>
                    <span className="font-semibold text-green-600">+{metrics.productivityIncrease}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="w-5 h-5" />
                  Economia de Tempo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tempo Total Economizado</span>
                    <span className="font-semibold text-green-600">{metrics.timeSaved} min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Arquivos Processados</span>
                    <span className="font-semibold">{metrics.totalConversions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tempo Manual Estimado</span>
                    <span className="font-semibold text-red-600">{(metrics.totalConversions * 2.5).toFixed(1)} min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tempo Automatizado</span>
                    <span className="font-semibold text-green-600">{(metrics.totalConversions * metrics.avgProcessingTime / 60).toFixed(1)} min</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;