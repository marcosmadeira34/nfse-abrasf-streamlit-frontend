//supportticket.tsx
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useTickets } from "@/hooks/use-tickets";
import { 
  HelpCircle, 
  Paperclip, 
  X, 
  Send,
  Upload
} from "lucide-react";

const SupportTicket = () => {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<'baixa' | 'media' | 'alta' | 'urgente'>('media');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { createTicket } = useTickets();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !description.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o assunto e a descrição.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
       // ✅ Aguarde o retorno da Promise
      const newTicket = await createTicket({
        subject,
        description,
        priority,
        attachments: attachedFiles,
      });

      console.log("Ticket criado:", newTicket);
      
      toast({
          title: "Ticket criado com sucesso!",
          description: `Ticket #${newTicket.id} foi criado. Em breve você receberá uma atualização por e-mail.`,
          variant: "default",
        });

        // Reset form
        setSubject("");
        setDescription("");
        setPriority("media");
        setAttachedFiles([]);
        setOpen(false);
      } catch (error) {
        toast({
          title: "Erro ao enviar ticket",
          description: "Ocorreu um erro. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
        >
          <HelpCircle className="w-4 h-4" />
          Suporte
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            Abrir Ticket de Suporte
          </DialogTitle>
          <DialogDescription>
            Descreva seu problema ou dúvida e nossa equipe entrará em contato.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="subject">Assunto *</Label>
            <Input
              id="subject"
              placeholder="Ex: Erro na conversão de PDF"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição da solicitação *</Label>
            <Textarea
              id="description"
              placeholder="Descreva detalhadamente seu problema ou dúvida..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="min-h-[120px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Prioridade</Label>
            <Select value={priority} onValueChange={(value: 'baixa' | 'media' | 'alta' | 'urgente') => setPriority(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baixa">Baixa</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachments">Anexar arquivos (opcional)</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="attachments"
                  className="flex flex-col items-center justify-center w-full h-24 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-2 pb-3">
                    <Upload className="w-6 h-6 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Clique para anexar arquivos
                    </p>
                  </div>
                  <input
                    id="attachments"
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                  />
                </label>
              </div>

              {attachedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Arquivos anexados:</p>
                  {attachedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm truncate max-w-[250px]">
                          {file.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-1 hover:bg-destructive/20 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar Ticket
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SupportTicket;