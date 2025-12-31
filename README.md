# Simply Backoffice

Sistema administrativo para Simply - Plataforma fintech de inversiones y financiamiento.

## 🚀 Stack Tecnológico

* **Frontend:** React 19 + TypeScript 5
* **Build Tool:** Vite 7
* **State Management:** Zustand + TanStack Query
* **UI:** Shadcn/ui + Radix UI + Tailwind CSS
* **Icons:** Lucide React

## ✅ Estado Actual

### Implementado (Fase 1)
- Login page funcional
- Dashboard con placeholders
- Gestión de usuarios (lista)
- Página de integraciones
- Auth store con Zustand
- API client con Axios + interceptors

### Pendiente
Ver `TODO.md` para lista completa de tareas.

## 📦 Instalación

```bash
npm install
```

## 🔧 Variables de Entorno

Crear `.env`:

```env
VITE_API_URL=https://sbgndespfp.us-east-1.awsapprunner.com
VITE_ENV=development
```

## 🏃‍♂️ Desarrollo

```bash
npm run dev
```

Abrir: http://localhost:5173

## 🏗️ Build

```bash
npm run build
```

Output: `dist/`

## 🔐 Credenciales de Testing

```
Email: admin@simply.com
Password: Admin123!
```

## 🚀 Deploy

Ver `DEPLOY_GUIDE.md` para guía completa de deploy en AWS Amplify.

### Quick Deploy

```bash
# Push a GitHub
git push origin main

# Amplify auto-deploy desde GitHub
```

## 📋 Endpoints Backend

- Auth: `POST /api/backoffice/auth/login`
- Users: `GET /api/backoffice/users`
- Dashboard: `GET /api/backoffice/dashboard/stats`
- Integrations: `GET /api/backoffice/integrations`

## 🎨 UI Components

Shadcn/ui components ya instalados en `src/components/ui/`

## 📁 Estructura

```
src/
├── components/    # UI components
├── pages/         # Páginas
├── services/      # API services
├── store/         # Zustand stores
├── hooks/         # Custom hooks
├── lib/           # Utils
└── types/         # TypeScript types
```

## 🔗 Links

- **Backend API:** https://sbgndespfp.us-east-1.awsapprunner.com
- **Landing:** https://paysur.com
- **Docs:** Ver `DEPLOY_GUIDE.md`

## 📝 Documentación

- `DEPLOY_GUIDE.md` - Guía completa de deploy
- `TODO.md` - Tareas pendientes
- `README.md` - Este archivo

---

**Última actualización:** 31 Diciembre 2024  
**Versión:** 1.0.0
