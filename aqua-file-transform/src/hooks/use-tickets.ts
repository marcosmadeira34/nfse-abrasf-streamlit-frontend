// use-tickets.ts
import { useState, useCallback } from 'react';

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'aberto' | 'em_andamento' | 'respondido' | 'fechado';
  priority: 'baixa' | 'media' | 'alta' | 'urgente';
  createdAt: Date;
  updatedAt: Date;
  attachments: File[];
  responses?: TicketResponse[];
}

export interface TicketResponse {
  id: string;
  message: string;
  isFromSupport: boolean;
  createdAt: Date;
  attachments?: File[];
}

export const useTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([
    // Dados de exemplo
    {
      id: '1',
      subject: 'Erro na conversão de PDF',
      description: 'Estou tendo problemas para converter um arquivo PDF específico.',
      status: 'aberto',
      priority: 'alta',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      attachments: [],
    },
    {
      id: '2',
      subject: 'Dúvida sobre limites de upload',
      description: 'Qual é o tamanho máximo de arquivo que posso fazer upload?',
      status: 'respondido',
      priority: 'media',
      createdAt: new Date('2024-01-14'),
      updatedAt: new Date('2024-01-16'),
      attachments: [],
      responses: [
        {
          id: '1',
          message: 'O limite atual é de 100MB por arquivo. Se precisar de um limite maior, entre em contato.',
          isFromSupport: true,
          createdAt: new Date('2024-01-16'),
        }
      ]
    }
  ]);

  const createTicket = useCallback(
  async (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { attachments?: File[] }) => {
    const formData = new FormData();
    formData.append('subject', ticketData.subject);
    formData.append('description', ticketData.description);
    formData.append('priority', ticketData.priority);
    
    // Log para verificar os anexos
    console.log('Anexos a serem enviados:', ticketData.attachments);
    
    if (ticketData.attachments && ticketData.attachments.length > 0) {
      ticketData.attachments.forEach((file, index) => {
        console.log(`Adicionando anexo ${index}:`, file.name, file.size);
        formData.append('attachments', file);
      });
    } else {
      console.log('Nenhum anexo para enviar');
      formData.append('attachments', '');
    }

    const backendUrl = import.meta.env.VITE_DJANGO_BACKEND_URL;
    if (!backendUrl) throw new Error('VITE_DJANGO_BACKEND_URL não definido');
    const token = localStorage.getItem('access_token');
    
    // Log da requisição
    console.log('Enviando requisição para:', `${backendUrl}/api/support-ticket/`);
    
    const response = await fetch(`${backendUrl}/api/support-ticket/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        // NÃO adicione 'Content-Type' aqui! O navegador define automaticamente para multipart/form-data
      },
      body: formData,
    });

    console.log('Response status:', response.status);
    const text = await response.text();
    console.log('Resposta bruta do backend:', text);
    
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      throw new Error(`Resposta inválida do backend: ${text}`);
    }

    if (!response.ok) {
      throw new Error(result.error || 'Erro desconhecido');
    }

    // Incluir os anexos no ticket retornado (mesmo que o backend não os retorne)
    return result.ticket || {
      id: Date.now().toString(),
      subject: ticketData.subject,
      description: ticketData.description,
      priority: ticketData.priority,
      status: 'aberto',
      createdAt: new Date(),
      updatedAt: new Date(),
      attachments: ticketData.attachments || [], // Adicionar os anexos enviados
    };
  },
  []
);

  const updateTicketStatus = useCallback((ticketId: string, status: Ticket['status']) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, status, updatedAt: new Date() }
        : ticket
    ));
  }, []);

  const addResponse = useCallback((ticketId: string, response: Omit<TicketResponse, 'id' | 'createdAt'>) => {
    const newResponse: TicketResponse = {
      ...response,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { 
            ...ticket, 
            responses: [...(ticket.responses || []), newResponse],
            updatedAt: new Date(),
            status: response.isFromSupport ? 'respondido' : ticket.status
          }
        : ticket
    ));
  }, []);

  const getTicketById = useCallback((ticketId: string) => {
    return tickets.find(ticket => ticket.id === ticketId);
  }, [tickets]);

  return {
    tickets,
    createTicket,
    updateTicketStatus,
    addResponse,
    getTicketById,
  };
};