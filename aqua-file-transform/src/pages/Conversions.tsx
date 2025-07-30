import { useState } from "react";
import { 
  FileText, 
  Download, 
  Trash2, 
  Search, 
  Filter,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ConversionHistory {
  id: string;
  fileName: string;
  originalFormat: string;
  convertedFormat: string;
  status: 'concluido' | 'processando' | 'erro';
  fileSize: string;
  createdAt: string;
  downloadUrl?: string;
}

const mockConversions: ConversionHistory[] = [
  {
    id: '1',
    fileName: 'Relatório_Anual_2024.pdf',
    originalFormat: 'PDF',
    convertedFormat: 'DOCX',
    status: 'concluido',
    fileSize: '2.5 MB',
    createdAt: '2024-01-15T10:30:00Z',
    downloadUrl: '#'
  },
  {
    id: '2',
    fileName: 'Apresentacao_Vendas.pdf',
    originalFormat: 'PDF',
    convertedFormat: 'PPTX',
    status: 'concluido',
    fileSize: '8.1 MB',
    createdAt: '2024-01-14T15:45:00Z',
    downloadUrl: '#'
  },
  {
    id: '3',
    fileName: 'Planilha_Custos.pdf',
    originalFormat: 'PDF',
    convertedFormat: 'XLSX',
    status: 'processando',
    fileSize: '1.8 MB',
    createdAt: '2024-01-14T09:20:00Z'
  },
  {
    id: '4',
    fileName: 'Manual_Usuario.pdf',
    originalFormat: 'PDF',
    convertedFormat: 'HTML',
    status: 'erro',
    fileSize: '5.2 MB',
    createdAt: '2024-01-13T14:10:00Z'
  }
];

const Conversions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [conversions] = useState<ConversionHistory[]>(mockConversions);

  const filteredConversions = conversions.filter(conversion => {
    const matchesSearch = conversion.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todos" || conversion.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluido':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'processando':
        return <Clock className="w-4 h-4 text-warning" />;
      case 'erro':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'concluido':
        return <Badge variant="secondary" className="bg-success/10 text-success border-success/20">Concluído</Badge>;
      case 'processando':
        return <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">Processando</Badge>;
      case 'erro':
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Conversões PDF
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie e acompanhe todas as suas conversões de documentos
          </p>
        </div>
        <Button className="w-fit">
          <FileText className="w-4 h-4 mr-2" />
          Nova Conversão
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por nome do arquivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="processando">Processando</SelectItem>
                  <SelectItem value="erro">Erro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversions List */}
      <div className="space-y-4">
        {filteredConversions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhuma conversão encontrada
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "todos" 
                  ? "Ajuste os filtros para ver mais resultados"
                  : "Faça sua primeira conversão para começar"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredConversions.map((conversion) => (
            <Card key={conversion.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">
                          {conversion.fileName}
                        </h3>
                        {getStatusIcon(conversion.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{conversion.originalFormat} → {conversion.convertedFormat}</span>
                        <span>{conversion.fileSize}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(conversion.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(conversion.status)}
                    <div className="flex gap-2">
                      {conversion.status === 'concluido' && conversion.downloadUrl && (
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumo das Conversões</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {conversions.filter(c => c.status === 'concluido').length}
              </div>
              <div className="text-sm text-muted-foreground">Concluídas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {conversions.filter(c => c.status === 'processando').length}
              </div>
              <div className="text-sm text-muted-foreground">Em Processamento</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">
                {conversions.filter(c => c.status === 'erro').length}
              </div>
              <div className="text-sm text-muted-foreground">Com Erro</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Conversions;