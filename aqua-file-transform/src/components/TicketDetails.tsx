import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTickets, Ticket } from "@/hooks/use-tickets";
import { useToast } from "@/hooks/use-toast";
import {
  Clock,
  MessageSquare,
  Paperclip,
  Send,
  User,
  Headphones,
  Upload,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TicketDetailsProps {
  ticket: Ticket;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TicketDetails = ({ ticket, open, onOpenChange }: TicketDetailsProps) => {
  const [newResponse, setNewResponse] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { addResponse } = useTickets();
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendResponse = async () => {
    if (!newResponse.trim()) {
      toast({
        title: "Mensagem vazia",
        description: "Por favor, digite uma mensagem antes de enviar.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simula envio da resposta
      await new Promise(resolve => setTimeout(resolve, 1000));

      addResponse(ticket.id, {
        message: newResponse,
        isFromSupport: false,
        attachments: attachedFiles,
      });

      toast({
        title: "Resposta enviada",
        description: "Sua mensagem foi adicionada ao ticket.",
      });

      setNewResponse("");
      setAttachedFiles([]);
    } catch (error) {
      toast({
        title: "Erro ao enviar resposta",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: Ticket['status']) => {
    switch (status) {
      case 'aberto': return 'text-red-600';
      case 'em_andamento': return 'text-yellow-600';
      case 'respondido': return 'text-blue-600';
      case 'fechado': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Ticket #{ticket.id}
            </div>
            <Badge variant="outline" className={getStatusColor(ticket.status)}>
              {ticket.status.replace('_', ' ')}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {ticket.subject}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
          {/* Coluna principal - Conversa */}
          <div className="lg:col-span-2 flex flex-col">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {/* Mensagem inicial */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-sm">Você</span>
                        <span className="text-xs text-muted-foreground">
                          {format(ticket.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
                      {ticket.attachments.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {ticket.attachments.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Paperclip className="w-3 h-3" />
                              <span>{file.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Respostas */}
                {ticket.responses?.map((response, index) => (
                  <div key={response.id} className="flex gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      response.isFromSupport ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'
                    }`}>
                      {response.isFromSupport ? (
                        <Headphones className="w-4 h-4" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={`p-4 rounded-lg ${
                        response.isFromSupport ? 'bg-green-50 border border-green-200' : 'bg-muted'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm">
                            {response.isFromSupport ? 'Suporte' : 'Você'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(response.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{response.message}</p>
                        {response.attachments && response.attachments.length > 0 && (
                          <div className="mt-3 space-y-1">
                            {response.attachments.map((file, fileIndex) => (
                              <div key={fileIndex} className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Paperclip className="w-3 h-3" />
                                <span>{file.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Campo de resposta */}
            {ticket.status !== 'fechado' && (
              <div className="mt-4 border-t pt-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="response">Adicionar resposta</Label>
                    <Textarea
                      id="response"
                      placeholder="Digite sua mensagem..."
                      value={newResponse}
                      onChange={(e) => setNewResponse(e.target.value)}
                      className="min-h-[80px] mt-1"
                    />
                  </div>

                  {/* Upload de arquivos */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="response-attachments"
                        className="flex flex-col items-center justify-center w-full h-16 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-center">
                          <Upload className="w-4 h-4 mr-2 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">
                            Anexar arquivos
                          </p>
                        </div>
                        <input
                          id="response-attachments"
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                        />
                      </label>
                    </div>

                    {attachedFiles.length > 0 && (
                      <div className="space-y-1">
                        {attachedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-muted rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <Paperclip className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs truncate max-w-[200px]">
                                {file.name}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="p-1 hover:bg-destructive/20 rounded transition-colors"
                            >
                              <X className="w-3 h-3 text-destructive" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button 
                    onClick={handleSendResponse}
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Resposta
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Informações do ticket */}
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <h3 className="font-medium text-sm">Informações do Ticket</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="outline" className={getStatusColor(ticket.status)}>
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prioridade:</span>
                  <Badge variant="secondary">
                    {ticket.priority}
                  </Badge>
                </div>
                
                <Separator className="my-2" />
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Criado em:</span>
                  <span>{format(ticket.createdAt, "dd/MM/yyyy", { locale: ptBR })}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Atualizado em:</span>
                  <span>{format(ticket.updatedAt, "dd/MM/yyyy", { locale: ptBR })}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Respostas:</span>
                  <span>{ticket.responses?.length || 0}</span>
                </div>
              </div>
            </div>

            {ticket.status === 'fechado' && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 text-sm">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">Ticket Fechado</span>
                </div>
                <p className="text-green-600 text-xs mt-1">
                  Este ticket foi resolvido e fechado.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketDetails;