import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTickets, Ticket } from "@/hooks/use-tickets";
import { useToast } from "@/hooks/use-toast";
import {
  TicketIcon,
  Search,
  Download,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import TicketDetails from "./TicketDetails";

const TicketManagement = () => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [priorityFilter, setPriorityFilter] = useState<string>("todas");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  const { tickets, updateTicketStatus } = useTickets();
  
  // Contar tickets não lidos/abertos para notificação
  const openTicketsCount = tickets.filter(ticket => ticket.status === 'aberto').length;
  const { toast } = useToast();

  const getStatusIcon = (status: Ticket['status']) => {
    switch (status) {
      case 'aberto':
        return <Clock className="w-4 h-4" />;
      case 'em_andamento':
        return <AlertCircle className="w-4 h-4" />;
      case 'respondido':
        return <MessageSquare className="w-4 h-4" />;
      case 'fechado':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <XCircle className="w-4 h-4" />;
    }
  };

  const getStatusVariant = (status: Ticket['status']) => {
    switch (status) {
      case 'aberto':
        return 'destructive';
      case 'em_andamento':
        return 'secondary';
      case 'respondido':
        return 'default';
      case 'fechado':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getPriorityVariant = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'urgente':
        return 'destructive';
      case 'alta':
        return 'secondary';
      case 'media':
        return 'default';
      case 'baixa':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'todas' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const downloadTicket = (ticket: Ticket) => {
    const ticketData = {
      id: ticket.id,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      responses: ticket.responses || []
    };

    const blob = new Blob([JSON.stringify(ticketData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket-${ticket.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download iniciado",
      description: "O arquivo do ticket foi baixado com sucesso.",
    });
  };

  const handleStatusChange = (ticketId: string, newStatus: Ticket['status']) => {
    updateTicketStatus(ticketId, newStatus);
    toast({
      title: "Status atualizado",
      description: "O status do ticket foi alterado com sucesso.",
    });
  };

  const openTicketDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setDetailsOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2 relative">
            <TicketIcon className="w-4 h-4" />
            Meus Tickets
            {openTicketsCount > 0 && (
              <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {openTicketsCount}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TicketIcon className="w-5 h-5 text-primary" />
              Gerenciamento de Tickets
            </DialogTitle>
            <DialogDescription>
              Acompanhe e gerencie suas solicitações de suporte.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="todos" className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <TabsList className="grid w-full sm:w-auto grid-cols-4">
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="abertos">Abertos</TabsTrigger>
                <TabsTrigger value="respondidos">Respondidos</TabsTrigger>
                <TabsTrigger value="fechados">Fechados</TabsTrigger>
              </TabsList>

              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Pesquisar tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-[250px]"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos Status</SelectItem>
                    <SelectItem value="aberto">Aberto</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="respondido">Respondido</SelectItem>
                    <SelectItem value="fechado">Fechado</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="todos" className="overflow-auto max-h-[60vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Assunto</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-mono text-sm">#{ticket.id}</TableCell>
                      <TableCell 
                        className="max-w-[300px] truncate font-medium"
                        onClick={() => openTicketDetails(ticket)}
                      >
                        {ticket.subject}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(ticket.status)} className="flex items-center gap-1 w-fit">
                          {getStatusIcon(ticket.status)}
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPriorityVariant(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(ticket.createdAt, "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadTicket(ticket)}
                            className="flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </Button>
                          
                          <Select
                            value={ticket.status}
                            onValueChange={(value: Ticket['status']) => handleStatusChange(ticket.id, value)}
                          >
                            <SelectTrigger className="w-[130px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="aberto">Aberto</SelectItem>
                              <SelectItem value="em_andamento">Em Andamento</SelectItem>
                              <SelectItem value="respondido">Respondido</SelectItem>
                              <SelectItem value="fechado">Fechado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredTickets.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <TicketIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum ticket encontrado</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="abertos">
              {/* Mesma tabela, mas filtrada por status aberto */}
            </TabsContent>
            
            <TabsContent value="respondidos">
              {/* Mesma tabela, mas filtrada por status respondido */}
            </TabsContent>
            
            <TabsContent value="fechados">
              {/* Mesma tabela, mas filtrada por status fechado */}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {selectedTicket && (
        <TicketDetails
          ticket={selectedTicket}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
        />
      )}
    </>
  );
};

export default TicketManagement;