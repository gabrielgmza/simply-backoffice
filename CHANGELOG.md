# Changelog - Simply Backoffice

## [2.2.0-PARTE1] - 2024-12-31

### ✨ Added - AUTH ACTUALIZADO + UI COMPONENTS

**Autenticación JWT:**
- ✅ authService actualizado para JWT (accessToken + refreshToken)
- ✅ Login con tokens reales
- ✅ Logout con llamada al backend
- ✅ getCurrentUser() para obtener datos actualizados del empleado

**Session Management:**
- ✅ useSessionTimeout hook (30 min de inactividad)
- ✅ Auto-logout con warning 5 min antes
- ✅ Throttle de eventos para optimización
- ✅ Integrado en ProtectedRoute

**Header Mejorado:**
- ✅ Dropdown con perfil
- ✅ Botón de logout funcional
- ✅ Avatar con iniciales
- ✅ Rol del empleado visible

**Componentes UI Reutilizables:**
- ✅ `DataTable` - Tabla con sorting, paginación, loading states
- ✅ `StatusBadge` - Badges con colores automáticos por status
- ✅ `RoleSelector` - Selector de roles con íconos y descripciones
- ✅ `RoleSelectDropdown` - Versión dropdown compacta

**Servicios:**
- ✅ authService.ts - JWT completo
- ✅ apiClient.ts - Ya tenía interceptor (sin cambios)

**Hooks:**
- ✅ useSessionTimeout.ts - Auto-logout por inactividad

### 🔧 Changed
- Migración de auth hardcoded a JWT real
- localStorage: `accessToken`, `refreshToken`, `user`
- LoginPage actualizado para nuevo formato de respuesta
- Header con logout funcional

### 📦 Components Nuevos

```
src/
├── hooks/
│   └── useSessionTimeout.ts      ✅ NUEVO
├── components/
│   └── ui/
│       ├── DataTable.tsx          ✅ NUEVO
│       ├── StatusBadge.tsx        ✅ NUEVO
│       └── RoleSelector.tsx       ✅ NUEVO
└── services/
    └── authService.ts             ✅ ACTUALIZADO
```

### ⏳ Pendiente (Entrega 2)

**Páginas:**
- ☐ src/pages/employees/EmployeesListPage.tsx
- ☐ src/pages/employees/EmployeeDetailPage.tsx
- ☐ src/pages/employees/CreateEmployeePage.tsx
- ☐ src/pages/tickets/TicketsPage.tsx
- ☐ src/pages/aria/AriaPage.tsx
- ☐ src/pages/settings/ProfilePage.tsx

**Servicios:**
- ☐ src/services/employeeService.ts
- ☐ src/services/ticketService.ts
- ☐ src/services/ariaService.ts

---

## [2.1.1] - 2024-12-31

### Added
- Leads page con tabla, filtros, exportación
- leadsService.ts
- Sidebar actualizado con link a Leads

---

## [2.1.0] - 2024-12-30

### Initial Release
- Login page
- Dashboard básico
- Users list page
- Integrations page
- shadcn/ui components
- Zustand store
- React Query
