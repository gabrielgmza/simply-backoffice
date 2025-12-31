# ✅ Actualización: Página de Leads Agregada

**Fecha:** 31 Diciembre 2024  
**Funcionalidad:** Ver leads capturados desde la landing page

---

## 📋 Cambios Realizados

### Frontend (Backoffice)

**Archivos nuevos:**
1. `src/services/leadsService.ts` - Servicio para consumir API de leads
2. `src/pages/leads/LeadsPage.tsx` - Página completa de leads con tabla y filtros

**Archivos modificados:**
1. `src/App.tsx` - Agregada ruta `/leads`
2. `src/components/layout/Sidebar.tsx` - Agregado link "Leads" en el menú

---

## 🎨 Funcionalidades de la Página de Leads

### Vista General
- Tabla con todos los leads registrados
- Cards con estadísticas:
  - Total de leads
  - Leads de hoy
  - Leads de la semana

### Filtros y Búsqueda
- Búsqueda por nombre, email o teléfono
- Ordenar por fecha o nombre
- Orden ascendente/descendente

### Tabla de Datos
Muestra:
- Nombre completo
- Email
- Teléfono
- Source (landing)
- UTM tracking
- Fecha de registro

### Paginación
- 20 leads por página
- Navegación anterior/siguiente
- Total de páginas

### Export
- Botón "Exportar CSV"
- Descarga todos los leads en formato CSV

---

## 🔧 Backend Requerido

Para que esta página funcione, necesitas agregar estos endpoints en el backend:

### Endpoint Principal
```
GET /api/backoffice/leads?page=1&limit=20&search=&sortBy=created_at&order=desc
```

### Endpoint de Detalle
```
GET /api/backoffice/leads/:id
```

### Endpoint de Export
```
GET /api/backoffice/leads/export
```

**Ver archivo:** `BACKEND_ENDPOINT_LEADS.md` para el código completo

---

## 📦 Cómo Deployar

### PASO 1: Subir a GitHub

```bash
cd simply-backoffice
git add .
git commit -m "Added Leads page with table and filters"
git push origin main
```

### PASO 2: Auto-Deploy

Amplify detectará el push automáticamente y hará el deploy (5-10 minutos).

### PASO 3: Verificar

```
https://main.d1hzpphech8pl4.amplifyapp.com/leads
```

---

## 🧪 Testing

### Sin Backend (Mock)

La página mostrará mensaje de error "Error al cargar leads" si el endpoint no existe.

### Con Backend

1. Agregar endpoints al backend
2. Deploy backend a App Runner
3. Recargar página de leads en backoffice
4. Deberías ver la tabla con datos reales

---

## 📊 Próximos Pasos

Una vez que funcione la página de Leads, podemos agregar:

1. **Contact Messages** - Ver mensajes del formulario de contacto
2. **Calculator Simulations** - Ver simulaciones de la calculadora
3. **Newsletter Subscribers** - Ver suscriptores del newsletter
4. **Dashboard Stats** - Conectar dashboard a datos reales

---

**Hora de subir a GitHub!** 🚀

