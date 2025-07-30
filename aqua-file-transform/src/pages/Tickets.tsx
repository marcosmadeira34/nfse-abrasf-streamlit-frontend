import TicketManagement from "@/components/TicketManagement";

const Tickets = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Meus Tickets
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie e acompanhe todos os seus tickets de suporte
        </p>
      </div>
      <TicketManagement />
    </div>
  );
};

export default Tickets;