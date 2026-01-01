# 🚀 Guía de Deploy - Simply Backoffice

**Fecha:** 31 Diciembre 2024  
**Versión:** 1.0.0  
**Backend API:** https://sbgndespfp.us-east-1.awsapprunner.com  

---

## ✅ Estado del Proyecto

### Implementado (Fase 1 - Inicial)

```
✅ Setup React + Vite + TypeScript
✅ Zustand store (auth)
✅ TanStack Query
✅ Shadcn/ui + Tailwind CSS
✅ Axios client con interceptors
✅ Páginas:
   - Login (/login)
   - Dashboard (/dashboard)
   - Users List (/users)
   - Integrations (/settings/integrations)
✅ Placeholders:
   - Transactions
   - Compliance
   - Support
   - Reports
   - Settings
```

### Pendiente (TODO.md)

```
⏳ Layout completo con sidebar RBAC
⏳ CRUD completo de usuarios
⏳ Más componentes UI
⏳ Transacciones
⏳ Compliance
⏳ Soporte
⏳ Reportes
⏳ AI Assistants
```

---

## 🔧 Configuración

### Variables de Entorno

**Archivo:** `.env.production` (ya creado)

```env
VITE_API_URL=https://sbgndespfp.us-east-1.awsapprunner.com
VITE_ENV=production
```

### URLs Actualizadas

```
✅ src/lib/apiClient.ts → Backend correcto
✅ src/services/authService.ts → Backend correcto
```

---

## 🚀 Deploy en AWS Amplify

### OPCIÓN 1: Desde GitHub (Recomendado)

#### Paso 1: Push a GitHub

```bash
# En tu máquina local
cd simply-backoffice
git add .
git commit -m "Updated API URLs for production"
git push origin main
```

#### Paso 2: Crear App en Amplify

```
AWS Console → Amplify → New app → Host web app
→ GitHub (conectar tu cuenta)
→ Repository: gabrielgmza/simply-backoffice
→ Branch: main
→ App name: simply-backoffice
```

#### Paso 3: Configurar Build

```
Framework: Vite
Build command: npm run build
Output directory: dist
Node version: 18
```

#### Paso 4: Variables de Entorno

```
VITE_API_URL = https://sbgndespfp.us-east-1.awsapprunner.com
VITE_ENV = production
```

#### Paso 5: Save and Deploy

```
Click: Save and deploy
Esperar: 5-10 minutos
```

**URL final:** `https://main.XXXXX.amplifyapp.com`

---

### OPCIÓN 2: Deploy Manual (Sin Git)

#### Paso 1: Build Local

```bash
cd simply-backoffice
npm install
npm run build
```

#### Paso 2: Comprimir dist/

```bash
cd dist
zip -r backoffice-build.zip .
```

#### Paso 3: Subir a Amplify

```
AWS Amplify → New app → Deploy without Git provider
→ Drag and drop: backoffice-build.zip
→ App name: simply-backoffice-manual
→ Deploy
```

---

## 🧪 Testing

### Probar Localmente

```bash
# Clonar repo
git clone https://github.com/gabrielgmza/simply-backoffice.git
cd simply-backoffice

# Instalar
npm install

# Crear .env local
cat > .env << 'ENVFILE'
VITE_API_URL=https://sbgndespfp.us-east-1.awsapprunner.com
VITE_ENV=development
ENVFILE

# Ejecutar
npm run dev
```

Abrir: http://localhost:5173

### Credenciales de Login

```
Email: admin@simply.com
Password: Admin123!
```

**Endpoint:**
```
POST https://sbgndespfp.us-east-1.awsapprunner.com/api/backoffice/auth/login
```

---

## 📊 Estructura del Proyecto

```
simply-backoffice/
├── public/              # Assets estáticos
├── src/
│   ├── components/      # Componentes reutilizables
│   │   ├── layout/      # Sidebar, Header
│   │   └── ui/          # Shadcn/ui components
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utilidades
│   │   ├── apiClient.ts # Axios instance
│   │   └── utils.ts     # Helper functions
│   ├── pages/           # Páginas
│   │   ├── auth/        # Login, MFA
│   │   ├── dashboard/   # Dashboard
│   │   ├── users/       # Gestión usuarios
│   │   └── settings/    # Configuración
│   ├── services/        # API services
│   │   ├── authService.ts
│   │   ├── usersService.ts
│   │   └── integrationsService.ts
│   ├── store/           # Zustand stores
│   │   └── authStore.ts
│   ├── types/           # TypeScript types
│   │   └── index.ts
│   ├── App.tsx          # Rutas principales
│   └── main.tsx         # Entry point
├── .env.production      # Variables de entorno
├── amplify.yml          # Config Amplify
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 🔐 Autenticación

### Flujo

```
1. Usuario ingresa email/password
2. POST /api/backoffice/auth/login
3. Backend valida credenciales
4. Retorna token JWT + user data
5. Token se guarda en localStorage
6. Todas las requests llevan: Authorization: Bearer {token}
7. Si token expira (401) → redirect a /login
```

### authStore (Zustand)

```typescript
interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}
```

---

## 📋 Endpoints del Backend

### Auth

```
POST /api/backoffice/auth/login
```

### Users

```
GET /api/backoffice/users
POST /api/backoffice/users
GET /api/backoffice/users/:id
PUT /api/backoffice/users/:id
DELETE /api/backoffice/users/:id
```

### Dashboard

```
GET /api/backoffice/dashboard/stats
```

### Integrations

```
GET /api/backoffice/integrations
PUT /api/backoffice/integrations/:id
```

---

## 🎨 UI Components

### Shadcn/ui

Ya instalados:
- Button
- Card
- Avatar
- Dropdown Menu
- Dialog
- Tabs
- Toast
- Label
- Select
- Separator
- Slot

### Pendientes (según TODO)

- Input, Textarea
- Table, DataTable
- Badge
- AlertDialog, Sheet
- Form components

---

## 🔄 CI/CD (Futuro)

### Con Amplify + GitHub

```
1. Push a main → Deploy automático
2. Pull Request → Preview deploy
3. Variables de entorno por branch
4. Rollback con un click
```

---

## 📊 Métricas de Performance

### Objetivo

```
Lighthouse Score: > 90
FCP: < 1.8s
LCP: < 2.5s
TTI: < 3.8s
CLS: < 0.1
```

### Optimizaciones

```
✅ Vite (Fast HMR)
✅ Code splitting (lazy routes)
✅ Tree shaking
⏳ Image optimization
⏳ Service Worker
⏳ Caching strategy
```

---

## 🐛 Troubleshooting

### Error: Login no funciona

**Verificar:**
```bash
# 1. Backend health check
curl https://sbgndespfp.us-east-1.awsapprunner.com/health

# 2. Test login endpoint
curl -X POST https://sbgndespfp.us-east-1.awsapprunner.com/api/backoffice/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@simply.com","password":"Admin123!"}'

# 3. Ver logs en browser
F12 → Console → Ver errors
```

### Error: Build falla en Amplify

**Solución:**
```
1. Verificar Node version: 18
2. Verificar npm ci funciona localmente
3. Ver build logs en Amplify console
4. Verificar variables de entorno
```

### Error: 404 en rutas

**Solución:**
```
Amplify → App settings → Rewrites and redirects
Add rule:
  Source: </^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|ttf)$)([^.]+$)/>
  Target: /index.html
  Type: 200 (Rewrite)
```

---

## 🔗 Links Útiles

- **Backoffice (Amplify):** https://main.XXXXX.amplifyapp.com
- **Backend API:** https://sbgndespfp.us-east-1.awsapprunner.com
- **Landing:** https://paysur.com
- **GitHub:** https://github.com/gabrielgmza/simply-backoffice
- **Shadcn/ui:** https://ui.shadcn.com
- **Tailwind:** https://tailwindcss.com

---

## 📝 Próximos Pasos

### Semana 1

```
1. ✅ Deploy inicial en Amplify
2. ⏳ Completar layout con sidebar
3. ⏳ Implementar CRUD de usuarios
4. ⏳ Dashboard con métricas reales
```

### Semana 2-3

```
5. ⏳ Transacciones
6. ⏳ Compliance (KYC)
7. ⏳ Soporte (Tickets)
8. ⏳ Reportes básicos
```

### Mes 2

```
9. ⏳ AI Assistants
10. ⏳ Analytics avanzado
11. ⏳ Testing completo
12. ⏳ Documentación
```

---

**¡Backoffice listo para deploy!** 🚀

