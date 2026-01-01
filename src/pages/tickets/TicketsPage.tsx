import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketService, Ticket } from '@/services/ticketService';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function TicketsPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await ticketService.getAll();
      setTickets(data.tickets);
    } catch (error) {
      toast.error('Error al cargar tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const columns: Column<Ticket>[] = [
    {
      key: 'title',
      label: 'Título',
      render: (t) => (
        <div>
          <div className="font-medium">{t.title}</div>
          <div className="text-xs text-gray-500">#{t.id.slice(0, 8)}</div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Categoría',
      render: (t) => <StatusBadge status={t.category} />
    },
    {
      key: 'priority',
      label: 'Prioridad',
      render: (t) => <StatusBadge status={t.priority} />
    },
    {
      key: 'status',
      label: 'Estado',
      render: (t) => <StatusBadge status={t.status} />
    },
    {
      key: 'assigned_to',
      label: 'Asignado a',
      render: (t) => t.assigned_to 
        ? `${t.assigned_to.first_name} ${t.assigned_to.last_name}`
        : 'Sin asignar'
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (t) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/tickets/${t.id}`)}
        >
          Ver Detalle
        </Button>
      )
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tickets</h1>
          <p className="text-gray-600 mt-1">Sistema de soporte interno</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Ticket
        </Button>
      </div>

      <div className="bg-white rounded-lg border">
        <DataTable
          data={tickets}
          columns={columns}
          isLoading={loading}
          emptyMessage="No hay tickets"
        />
      </div>
    </div>
  );
}
