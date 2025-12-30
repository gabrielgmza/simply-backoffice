# Simply Backoffice

Sistema administrativo para Simply - Plataforma fintech de inversiones y financiamiento.

## 🚀 Stack Tecnológico

- **Frontend:** React 18 + TypeScript 5
- **Build Tool:** Vite
- **State Management:** Zustand + TanStack Query
- **UI:** Shadcn/ui + Radix UI + Tailwind CSS
- **Icons:** Lucide React

## 📦 Instalación

```bash
npm install
```

## 🔧 Variables de Entorno

Crear `.env`:
```env
VITE_API_URL=https://api-url.com/api
VITE_ENV=beta
```

## 🏃‍♂️ Desarrollo

```bash
npm run dev
```

## 🔌 Integraciones

Gestiona activación/desactivación de APIs desde Settings:
- BIND (bancario), didit (KYC), Stripe (crypto)
- VISA, Rapipago, COELSA, MODO
- Anthropic (AI Assistants)

Ver `/src/pages/settings/IntegrationsPage.tsx`
