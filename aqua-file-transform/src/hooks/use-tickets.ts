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

  const createTicket = useCallback((ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const newTicket: Ticket = {
      ...ticketData,
      id: Date.now().toString(),
      status: 'aberto',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTickets(prev => [newTicket, ...prev]);
    return newTicket;
  }, []);

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