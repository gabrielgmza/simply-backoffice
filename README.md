# Simply Backoffice

Panel de administración para la plataforma Simply by PaySur.

## 🚀 Stack Tecnológico

- **React 18** + TypeScript
- **Vite** - Build tool
- **Material UI 5** - Componentes UI
- **MUI X Data Grid** - Tablas avanzadas
- **React Router 6** - Navegación
- **Axios** - HTTP Client
- **Recharts** - Gráficos
- **date-fns** - Manejo de fechas
- **react-hot-toast** - Notificaciones

## 📁 Estructura del Proyecto

```
src/
├── components/         # Componentes reutilizables
│   └── Layout/        # Layout principal
├── contexts/          # Context providers (Auth)
├── hooks/             # Custom hooks
├── pages/             # Páginas/vistas
│   ├── Dashboard.tsx
│   ├── Settings.tsx
│   ├── Users.tsx
│   ├── UserDetail.tsx
│   ├── Investments.tsx
│   ├── InvestmentDetail.tsx
│   ├── Financings.tsx
│   ├── FinancingDetail.tsx
│   ├── AuditLogs.tsx
│   └── Employees.tsx
├── services/          # API services
├── types/             # TypeScript types
├── utils/             # Utilidades
├── App.tsx           # Router principal
├── main.tsx          # Entry point
└── theme.ts          # Tema MUI
```

## ⚙️ Instalación

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Configurar API URL en .env
VITE_API_URL=http://localhost:8080

# Iniciar desarrollo
npm run dev

# Build producción
npm run build
```

## 🔐 Autenticación

El sistema usa JWT para autenticación. Los tokens se almacenan en localStorage.

### Roles disponibles:

| Rol | Descripción |
|-----|-------------|
| SUPER_ADMIN | Acceso total a todas las funciones |
| ADMIN | Gestión de usuarios, inversiones, financiaciones |
| COMPLIANCE | Revisión KYC, bloqueos, auditoría |
| CUSTOMER_SERVICE | Atención al cliente, tickets |
| ANALYST | Reportes, métricas, solo lectura |

## 📱 Páginas

### Dashboard
- Métricas principales (AUM, financiaciones, NPL)
- Gráficos de actividad
- Últimas inversiones/financiaciones

### Configuración del Sistema
- Variables del sistema por categoría
- Tasas (FCI, penalización)
- Límites (financiamiento, transferencias)
- Feature flags
- Historial de cambios
- Simulación de impacto

### Usuarios
- Listado con filtros (estado, KYC, nivel)
- Perfil completo con resumen financiero
- Bloqueo/desbloqueo
- Ajuste de límites
- Cambio de nivel
- Flags de riesgo

### Inversiones
- Listado con estadísticas
- Detalle con rendimientos históricos
- Ajuste manual de valor
- Liquidación forzada
- Exportación CSV

### Financiaciones
- Listado con métricas de riesgo
- Detalle con cuotas
- Pago manual de cuotas
- Condonación de penalizaciones
- Extensión de vencimientos
- Liquidación forzada
- NPL ratio

### Auditoría
- Log de todas las acciones
- Filtros por acción, recurso, estado
- Estadísticas por período

### Empleados
- CRUD de empleados
- Asignación de roles
- Control de accesos

## 🔌 API Endpoints Utilizados

```typescript
// Auth
POST /api/backoffice/auth/login
GET  /api/backoffice/auth/me

// Settings
GET  /api/backoffice/settings
PUT  /api/backoffice/settings/:key
POST /api/backoffice/settings/:key/simulate
GET  /api/backoffice/settings/history

// Users
GET  /api/backoffice/users
GET  /api/backoffice/users/:id/full
POST /api/backoffice/users/:id/block
POST /api/backoffice/users/:id/unblock
PATCH /api/backoffice/users/:id/limits
PATCH /api/backoffice/users/:id/level

// Investments
GET  /api/backoffice/investments
GET  /api/backoffice/investments/:id
GET  /api/backoffice/investments/stats/overview
POST /api/backoffice/investments/:id/liquidate
PATCH /api/backoffice/investments/:id/value

// Financings
GET  /api/backoffice/financings
GET  /api/backoffice/financings/:id
GET  /api/backoffice/financings/stats/overview
POST /api/backoffice/financings/installments/:id/pay
POST /api/backoffice/financings/:id/liquidate
POST /api/backoffice/financings/installments/:id/waive
POST /api/backoffice/financings/installments/:id/extend

// Audit
GET  /api/backoffice/audit
GET  /api/backoffice/audit/stats

// Employees
GET  /api/backoffice/employees
POST /api/backoffice/employees
PUT  /api/backoffice/employees/:id
DELETE /api/backoffice/employees/:id
```

## 🎨 Tema

El backoffice usa un tema oscuro con la paleta de colores de Simply:

- **Primary:** #6366f1 (Indigo)
- **Secondary:** #ec4899 (Pink)
- **Success:** #10b981 (Emerald)
- **Warning:** #f59e0b (Amber)
- **Error:** #ef4444 (Red)
- **Background:** #0f172a / #1e293b

### Colores de niveles:
- PLATA: #94a3b8
- ORO: #fbbf24
- BLACK: #475569
- DIAMANTE: #818cf8

## 📦 Build & Deploy

```bash
# Build
npm run build

# El output estará en /dist
# Subir a S3/CloudFront o servidor estático
```

### Variables de producción:
```env
VITE_API_URL=https://api.paysur.com
```

## 🔒 Seguridad

- Tokens JWT con expiración de 24h
- Interceptor de Axios para manejo de 401
- Permisos granulares por rol
- Audit log de todas las acciones
- Sin almacenamiento de datos sensibles en frontend

## 📝 Próximos Features

- [ ] Dashboard con más métricas
- [ ] Notificaciones en tiempo real
- [ ] Sistema de tickets
- [ ] Gestión de leads
- [ ] Reportes avanzados
- [ ] Exportación a Excel
- [ ] Dark/Light mode toggle

---

**Simply Backoffice v1.0.0**
© 2025 PaySur
