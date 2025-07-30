import { useState, useEffect } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText,
  Download,
  Clock,
  Calendar,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MetricsCard from "@/components/MetricsCard";

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("7d");
  const [metrics, setMetrics] = useState({
    totalConversions: 1247,
    successfulConversions: 1189,
    activeUsers: 156,
    avgProcessingTime: 2.3,
    totalDownloads: 1098,
    errorRate: 4.6
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        totalConversions: prev.totalConversions + Math.floor(Math.random() * 2),
        successfulConversions: prev.successfulConversions + Math.floor(Math.random() * 2),
        activeUsers: Math.max(0, prev.activeUsers + Math.floor(Math.random() * 5 - 2)),
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const conversionsByFormat = [
    { format: "PDF → DOCX", count: 423, percentage: 34 },
    { format: "PDF → XLSX", count: 312, percentage: 25 },
    { format: "PDF → PPTX", count: 187, percentage: 15 },
    { format: "PDF → HTML", count: 156, percentage: 13 },
    { format: "PDF → TXT", count: 124, percentage: 10 },
    { format: "Outros", count: 45, percentage: 3 }
  ];

  const conversionsByDay = [
    { day: "Segunda", conversions: 178 },
    { day: "Terça", conversions: 195 },
    { day: "Quarta", conversions: 165 },
    { day: "Quinta", conversions: 201 },
    { day: "Sexta", conversions: 243 },
    { day: "Sábado", conversions: 156 },
    { day: "Domingo", conversions: 109 }
  ];

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
          trend="up"
          trendValue="+12% vs período anterior"
          icon={<FileText className="w-6 h-6" />}
        />
        <MetricsCard
          title="Taxa de Sucesso"
          value={`${((metrics.successfulConversions / metrics.totalConversions) * 100).toFixed(1)}%`}
          subtitle="Conversões bem-sucedidas"
          trend="up"
          trendValue="+2.3% vs período anterior"
          icon={<TrendingUp className="w-6 h-6" />}
        />
        <MetricsCard
          title="Usuários Ativos"
          value={metrics.activeUsers.toString()}
          subtitle="Usuários únicos"
          trend="up"
          trendValue="+8% vs período anterior"
          icon={<Users className="w-6 h-6" />}
        />
        <MetricsCard
          title="Tempo Médio"
          value={`${metrics.avgProcessingTime}s`}
          subtitle="Processamento por arquivo"
          trend="down"
          trendValue="-0.5s vs período anterior"
          icon={<Clock className="w-6 h-6" />}
        />
        <MetricsCard
          title="Downloads"
          value={metrics.totalDownloads.toLocaleString()}
          subtitle="Arquivos baixados"
          trend="up"
          trendValue="+15% vs período anterior"
          icon={<Download className="w-6 h-6" />}
        />
        <MetricsCard
          title="Taxa de Erro"
          value={`${metrics.errorRate}%`}
          subtitle="Conversões com falha"
          trend="down"
          trendValue="-1.2% vs período anterior"
          icon={<BarChart3 className="w-6 h-6" />}
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
                {conversionsByDay.map((item) => (
                  <div key={item.day} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <span className="font-medium">{item.day}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${(item.conversions / 250) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-12 text-right">
                        {item.conversions}
                      </span>
                    </div>
                  </div>
                ))}
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
                    <span className="text-sm text-muted-foreground">Média</span>
                    <span className="font-semibold">{metrics.avgProcessingTime}s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Mais rápido</span>
                    <span className="font-semibold text-success">0.8s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Mais lento</span>
                    <span className="font-semibold text-warning">12.4s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">P95</span>
                    <span className="font-semibold">6.2s</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Qualidade do Serviço
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Uptime</span>
                    <span className="font-semibold text-success">99.8%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Taxa de Erro</span>
                    <span className="font-semibold text-destructive">{metrics.errorRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Satisfação</span>
                    <span className="font-semibold text-success">4.8/5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Resposta Média</span>
                    <span className="font-semibold">1.2s</span>
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