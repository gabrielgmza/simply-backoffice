# Simply Backoffice v2.2.0 PARTE 1

Frontend del backoffice para Simply fintech platform con autenticación JWT, session timeout y componentes UI reutilizables.

## 🚀 Stack Tecnológico

* React 18
* TypeScript 5
* Vite 7
* TailwindCSS
* shadcn/ui + Radix UI
* Zustand (state management)
* TanStack Query
* React Router DOM

## ✨ Features v2.2.0 PARTE 1

### Autenticación JWT
- Login con accessToken + refreshToken
- Auto-refresh de tokens
- Logout con llamada al backend
- getCurrentUser() actualizado

### Session Timeout
- Auto-logout después de 30 min de inactividad
- Warning 5 minutos antes
- Eventos detectados: mousedown, mousemove, keydown, scroll, touchstart, click
- Throttle para optimización

### Header con Logout
- Dropdown con perfil de usuario
- Nombre, rol y avatar
- Opciones: Mi Perfil, Configuración, Cerrar Sesión
- Botón de notificaciones

### Componentes UI Reutilizables

**DataTable**
```tsx
<DataTable
  data={employees}
  columns={columns}
  onSort={handleSort}
  sortKey="created_at"
  sortDirection="desc"
  isLoading={loading}
  emptyMessage="No hay empleados"
/>
```

**StatusBadge**
```tsx
<StatusBadge status="ACTIVE" />
<StatusBadge status="PENDING" variant="warning" />
```

**RoleSelector**
```tsx
<RoleSelector 
  value={role}
  onChange={setRole}
  allowedRoles={['ADMIN', 'ANALYST']}
/>

// Versión dropdown compacta
<RoleSelectDropdown 
  value={role}
  onChange={setRole}
/>
```

## 📁 Estructura

```
src/
├── hooks/
│   └── useSessionTimeout.ts      # Auto-logout
├── components/
│   ├── layout/
│   │   ├── Header.tsx            # Con logout
│   │   ├── Sidebar.tsx
│   │   └── MainLayout.tsx
│   └── ui/
│       ├── DataTable.tsx         # Tabla reutilizable
│       ├── StatusBadge.tsx       # Badges
│       └── RoleSelector.tsx      # Selector de roles
├── services/
│   ├── authService.ts            # JWT actualizado
│   ├── leadsService.ts
│   └── usersService.ts
├── store/
│   └── authStore.ts              # Zustand
└── pages/
    ├── auth/
    │   └── LoginPage.tsx
    ├── dashboard/
    ├── users/
    ├── leads/
    └── settings/
```

## 🛠️ Setup

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
# .env.production
VITE_API_URL=https://sbgndespfp.us-east-1.awsapprunner.com
```

### 3. Desarrollo
```bash
npm run dev
```

### 4. Build para producción
```bash
npm run build
```

### 5. Deploy a Amplify
```bash
# Subir a GitHub y Amplify auto-deploya
git add .
git commit -m "v2.2.0 PARTE 1"
git push origin main
```

## 🔐 Autenticación

### Login
```typescript
const response = await authService.login({ email, password });
if (response.success) {
  const { accessToken, refreshToken, user } = response.data;
  // Tokens guardados automáticamente en localStorage
}
```

### Logout
```typescript
await authService.logout();
// Limpia tokens y redirige a /login
```

### Get Current User
```typescript
const user = await authService.getCurrentUser();
```

## 🎨 Componentes UI

### DataTable
- Sorting (asc/desc)
- Loading states con skeleton
- Empty states
- Customizable columns
- Render props para contenido personalizado

### StatusBadge
- Auto-detect variant por status
- Colores predefinidos para: ACTIVE, PENDING, RESOLVED, etc
- Custom colors support
- Traducciones automáticas

### RoleSelector
- 5 roles: SUPER_ADMIN, ADMIN, COMPLIANCE, CUSTOMER_SERVICE, ANALYST
- Íconos y descripciones
- Versión grid (2 columnas)
- Versión dropdown (compacta)
- Disabled state support

## 📝 Próximas Features (Entrega 2)

- Página de empleados (lista, crear, editar)
- Sistema de tickets
- Aria (AI Assistant)
- Perfil de empleado
- Dashboard avanzado

## 🔗 URLs

**Production:** https://main.d1hzpphech8pl4.amplifyapp.com  
**API:** https://sbgndespfp.us-east-1.awsapprunner.com

## 📞 Contacto

**Developer:** Gabriel  
**Version:** 2.2.0-PARTE1
