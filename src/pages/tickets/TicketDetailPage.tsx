import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketService, Ticket } from '@/services/ticketService';
import { employeeService } from '@/services/employeeService';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Send, User, Calendar, Tag, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore(state => state.employee);
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<any[]>([]);
  const [comment, setComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTicket();
    loadEmployees();
  }, [id]);

  const loadTicket = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await ticketService.getById(id);
      setTicket(data);
    } catch (error) {
      toast.error('Error al cargar ticket');
      navigate('/tickets');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const data = await employeeService.getAll({ status: 'ACTIVE' });
      setEmployees(data.employees);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !id) return;

    try {
      setSubmitting(true);
      await ticketService.addComment(id, comment, isInternal);
      setComment('');
      setIsInternal(false);
      toast.success('Comentario agregado');
      loadTicket();
    } catch (error) {
      toast.error('Error al agregar comentario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;

    try {
      await ticketService.updateStatus(id, newStatus);
      toast.success('Estado actualizado');
      loadTicket();
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  const handleAssign = async (employeeId: string) => {
    if (!id) return;

    try {
      await ticketService.assign(id, employeeId);
      toast.success('Ticket asignado');
      loadTicket();
    } catch (error) {
      toast.error('Error al asignar ticket');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/tickets')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>
            <p className="text-sm text-gray-500">#{ticket.id.slice(0, 8)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <StatusBadge status={ticket.status} />
          <StatusBadge status={ticket.priority} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Descripción</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle>Comentarios ({ticket.comments?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticket.comments && ticket.comments.length > 0 ? (
                ticket.comments.map((c) => (
                  <div
                    key={c.id}
                    className={`p-4 rounded-lg border ${
                      c.is_internal ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium text-sm">
                          {c.employee.first_name[0]}{c.employee.last_name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900">
                            {c.employee.first_name} {c.employee.last_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(c.created_at).toLocaleString('es-AR')}
                          </p>
                        </div>
                      </div>
                      {c.is_internal && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Interno
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{c.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No hay comentarios aún</p>
              )}

              {/* Add Comment */}
              <div className="border-t pt-4 mt-4">
                <Textarea
                  placeholder="Escribir un comentario..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="mb-3"
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-gray-700">Comentario interno</span>
                  </label>
                  <Button
                    onClick={handleAddComment}
                    disabled={!comment.trim() || submitting}
                  >
                    {submitting ? (
                      'Enviando...'
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={ticket.status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Abierto</SelectItem>
                  <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                  <SelectItem value="WAITING">En Espera</SelectItem>
                  <SelectItem value="RESOLVED">Resuelto</SelectItem>
                  <SelectItem value="CLOSED">Cerrado</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Assign */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="w-4 h-4" />
                Asignado a
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={ticket.assigned_to?.id || 'unassigned'}
                onValueChange={(val) => val !== 'unassigned' && handleAssign(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Sin asignar</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {ticket.assigned_to && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">
                    {ticket.assigned_to.first_name} {ticket.assigned_to.last_name}
                  </p>
                  <p className="text-xs text-gray-500">{ticket.assigned_to.email}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Detalles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Categoría</p>
                <StatusBadge status={ticket.category} />
              </div>
              
              <div>
                <p className="text-xs text-gray-500 mb-1">Prioridad</p>
                <StatusBadge status={ticket.priority} />
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Creado por
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {ticket.created_by.first_name} {ticket.created_by.last_name}
                </p>
                <p className="text-xs text-gray-500">{ticket.created_by.email}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Creado
                </p>
                <p className="text-sm text-gray-900">
                  {new Date(ticket.created_at).toLocaleString('es-AR')}
                </p>
              </div>

              {ticket.resolved_at && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Resuelto</p>
                  <p className="text-sm text-gray-900">
                    {new Date(ticket.resolved_at).toLocaleString('es-AR')}
                  </p>
                </div>
              )}

              {ticket.tags && ticket.tags.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ticket.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
