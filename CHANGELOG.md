# Changelog - Simply Backoffice

## [2.1.1] - 2024-12-31

### Added
- **Página de Leads** - Página completa para ver leads del landing
  - Tabla con datos de PostgreSQL en tiempo real
  - Cards con estadísticas (Total, Hoy, Esta Semana)
  - Búsqueda por nombre, apellido, email, teléfono
  - Ordenamiento por fecha o nombre (asc/desc)
  - Paginación (20 leads por página)
  - Export CSV con todos los leads
  - Link en sidebar para acceder a /leads

### Technical
- Nuevo servicio: `src/services/leadsService.ts`
- Nueva página: `src/pages/leads/LeadsPage.tsx`
- Actualizado `src/App.tsx` con ruta `/leads`
- Actualizado `src/components/layout/Sidebar.tsx` con icono UserPlus
- Consumo de endpoints: GET /api/backoffice/leads, GET /api/backoffice/leads/:id, GET /api/backoffice/leads/export

---

## [2.1.0] - 2024-12-30

### Initial Release
- Login page con autenticación
- Dashboard con placeholders
- Users list page
- Integrations page
- Protected routes
- Shadcn/ui components
- Tailwind CSS
- TanStack Query
- Zustand state management
- Deploy en AWS Amplify
