# Simply Backoffice - Tareas Pendientes

## ✅ Completado (Fase 1 - Inicio)

- [x] Setup proyecto React + Vite + TypeScript
- [x] Configuración Tailwind CSS
- [x] Estructura de carpetas
- [x] Tipos TypeScript completos (roles, permisos, entidades)
- [x] Store de autenticación (Zustand)
- [x] Cliente API (Axios + interceptors)
- [x] Servicio de integraciones
- [x] Página de integraciones (activar/desactivar APIs)
- [x] Componentes UI base (Button, Card)

## 🚧 En Progreso (Próximos pasos)

### Componentes UI (Shadcn/ui)
- [ ] Input, Textarea, Select
- [ ] Dialog, AlertDialog, Sheet
- [ ] Table, DataTable
- [ ] Badge, Avatar, Separator
- [ ] Tabs, Toast, Dropdown
- [ ] Form components con React Hook Form

### Layout
- [ ] Sidebar con navegación RBAC
- [ ] Header con user menu
- [ ] MainLayout wrapper
- [ ] ProtectedRoute component

### Auth
- [ ] Login page
- [ ] MFA (TOTP) page
- [ ] Password recovery
- [ ] Logout functionality

### Dashboard
- [ ] Dashboard principal con métricas
- [ ] Gráficos (Recharts)
- [ ] Cards de estadísticas
- [ ] Accesos rápidos por rol
- [ ] Widget AI Assistant (placeholder)

### Usuarios
- [ ] Lista de usuarios con tabla
- [ ] Filtros avanzados
- [ ] Perfil detallado de usuario
- [ ] Modal editar usuario
- [ ] Acciones: suspender, reactivar

### Transacciones
- [ ] Lista de transacciones
- [ ] Filtros por tipo, estado, fechas
- [ ] Detalle de transacción
- [ ] Reversión (con permisos)
- [ ] Exportar CSV/Excel

### Compliance
- [ ] Lista de verificaciones KYC pendientes
- [ ] Modal aprobar/rechazar KYC
- [ ] Gestión de ROS
- [ ] Sistema de retenciones (crear, listar, liberar)
- [ ] Búsqueda PEP

### Soporte
- [ ] Dashboard de tickets
- [ ] Lista de tickets con filtros
- [ ] Detalle de ticket con conversación
- [ ] Responder ticket
- [ ] Asignar/escalar tickets
- [ ] AI suggestion component (placeholder)

### Reportes
- [ ] Reportes financieros
- [ ] Reportes de usuarios
- [ ] Reportes de transacciones
- [ ] Reportes de compliance
- [ ] Exportar PDF/Excel
- [ ] Filtros por rango de fechas

### Configuración
- [ ] Gestión de empleados
- [ ] Crear/editar empleados
- [ ] Asignar roles
- [ ] Integrations (YA HECHO)
- [ ] Audit logs viewer
- [ ] Configuración de notificaciones

### Servicios API
- [ ] authService (login, logout, refresh)
- [ ] usersService (CRUD usuarios)
- [ ] transactionsService (listar, detalle, revertir)
- [ ] complianceService (KYC, ROS, retenciones)
- [ ] supportService (tickets, mensajes)
- [ ] reportsService (generar reportes)
- [ ] employeesService (gestión empleados)
- [ ] integrationsService (✅ YA HECHO)

### Hooks
- [ ] usePermission (check permisos)
- [ ] useDebounce (para búsquedas)
- [ ] useTableFilters (filtros de tablas)
- [ ] usePagination (paginación)

### Utils
- [ ] formatCurrency (formato moneda)
- [ ] formatDate (formato fechas)
- [ ] formatStatus (badges de estado)
- [ ] exportToCSV (exportar datos)
- [ ] downloadFile (descargar archivos)

## 🔜 Futuro (Post-MVP)

### AI Assistants
- [ ] Chat interface por empleado
- [ ] Integración con Anthropic API
- [ ] Tools execution
- [ ] Context management
- [ ] Historial de conversaciones

### Analytics Avanzado
- [ ] Dashboards interactivos
- [ ] Gráficos personalizables
- [ ] Métricas en tiempo real
- [ ] Alertas personalizadas

### Notificaciones
- [ ] Sistema de notificaciones en app
- [ ] Email notifications
- [ ] Slack integration (opcional)
- [ ] Push notifications

### Testing
- [ ] Unit tests (Vitest)
- [ ] Integration tests
- [ ] E2E tests (Playwright)
- [ ] Coverage > 80%

### Documentación
- [ ] Storybook para componentes
- [ ] Documentación de API
- [ ] Guías de usuario por rol
- [ ] Video tutoriales

### Performance
- [ ] Code splitting
- [ ] Lazy loading de rutas
- [ ] Image optimization
- [ ] Caching strategy
- [ ] Lighthouse score > 90

## 📝 Notas de Desarrollo

### Prioridad Alta
1. Completar componentes UI básicos
2. Layout + Auth
3. Dashboard
4. Usuarios (CRUD completo)
5. Integraciones (✅ DONE)

### Prioridad Media
6. Transacciones
7. Compliance (KYC + Retenciones)
8. Soporte (Tickets)
9. Reportes básicos

### Prioridad Baja
10. AI Assistants (placeholder por ahora)
11. Analytics avanzado
12. Notificaciones push
13. Testing completo

## 🔗 Referencias

- [Shadcn/ui Docs](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://docs.pmnd.rs/zustand/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)

## 🎯 Objetivo Inmediato

**Completar Fase 1 (2-3 semanas):**
- Layout funcional con sidebar RBAC
- Auth completo (login + MFA)
- Dashboard básico
- Usuarios CRUD
- Integraciones ✅
- Deploy a AWS Amplify

Una vez terminado Fase 1, conectar backend y comenzar Fase 2.
