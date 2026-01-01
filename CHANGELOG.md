# Changelog - Simply Backoffice

## [2.2.0] - 2024-12-31

### ✨ Added - COMPLETE BACKOFFICE v2.2.0

**Autenticación JWT:**
- authService con JWT (accessToken + refreshToken)
- Login/Logout funcional
- getCurrentUser()

**Session Management:**
- useSessionTimeout hook (30 min)
- Auto-logout con warning
- Integrado en ProtectedRoute

**Componentes UI:**
- DataTable - Tabla reutilizable con sorting, loading, empty states
- StatusBadge - Badges auto-coloreados por status
- RoleSelector - Selector de roles (grid + dropdown)

**Páginas - Empleados:**
- EmployeesListPage - Lista con DataTable, filtros, stats
- CreateEmployeePage - Formulario con RoleSelector
- employeeService.ts

**Páginas - Tickets:**
- TicketsPage - Lista de tickets con filtros
- ticketService.ts

**Páginas - Aria AI:**
- AriaPage - Chat interface con Claude
- ariaService.ts
- Conversaciones persistentes
- Auto-scroll, loading states

**Header:**
- Dropdown con perfil
- Logout funcional
- Avatar con iniciales

**Sidebar:**
- Links: Empleados, Tickets, Aria AI
- Iconos actualizados

**Servicios:**
- src/services/employeeService.ts
- src/services/ticketService.ts
- src/services/ariaService.ts

**Hooks:**
- src/hooks/useSessionTimeout.ts

---

## [2.1.1] - 2024-12-31

### Added
- Leads page
- leadsService.ts

---

## [2.1.0] - 2024-12-30

### Initial Release
- Login page
- Dashboard básico
- Users list
- Integrations page
