# 🚗 Suzuki — Encuesta de Satisfacción

App PWA instalable para tablets de punto de encuesta en concesionarios Suzuki.

## Stack

- **Next.js 14** — Framework React
- **TypeScript** — Tipado estático
- **Tailwind CSS** — Estilos utilitarios
- **Framer Motion** — Micro-interacciones
- **MongoDB + Mongoose** — Persistencia de datos
- **next-pwa** — Service Worker & instalación PWA

## Características

- ✅ 3 pasos de encuesta con transiciones fluidas
- ✅ Caras emoji animadas (verde/amarillo/rojo)
- ✅ Micro-interacciones: ripple, bounce, glow
- ✅ Pantalla de agradecimiento con countdown de 6s
- ✅ Auto-reset para siguiente cliente
- ✅ Datos guardados en MongoDB
- ✅ PWA instalable en tablet (modo landscape)
- ✅ Funciona offline (service worker)
- ✅ Soporte de teclado físico (teclas 1, 2, 3)

## Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con tu connection string de MongoDB:

```
MONGODB_URI=mongodb://localhost:27017/suzuki_survey
```

Para MongoDB Atlas (producción):
```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/suzuki_survey
```

### 3. Generar íconos PWA (opcional)

```bash
npm install canvas --save-dev
node scripts/generate-icons.js
```

O coloca manualmente íconos PNG en `public/icons/` con los siguientes tamaños:
`72, 96, 128, 144, 152, 192, 384, 512`

### 4. Modo desarrollo

```bash
npm run dev
```

La app estará disponible en `http://localhost:3000`

### 5. Build para producción

```bash
npm run build
npm start
```

## Configurar tablet como PWA

### En iPad / Android Tablet:

1. Abrir la URL de la app en Safari/Chrome
2. Tocar el botón de compartir → "Agregar a pantalla de inicio"
3. La app se instalará como PWA en modo pantalla completa
4. Configurar el tablet en modo quiosco (opcional) para evitar que los clientes salgan

### Modo quiosco en iPad (Acceso Guiado):

1. Ir a Configuración → Accesibilidad → Acceso Guiado
2. Activar Acceso Guiado
3. Abrir la app Suzuki Encuesta
4. Presionar 3 veces el botón lateral para activar el modo quiosco

## Estructura del proyecto

```
suzuki-survey/
├── components/
│   ├── FaceButton.tsx      # Botones emoji con animaciones
│   ├── SuzukiLogo.tsx      # Logo SVG de Suzuki
│   ├── StepDots.tsx        # Indicador de progreso
│   └── ThankYouScreen.tsx  # Pantalla final con countdown
├── lib/
│   ├── mongodb.ts          # Conexión a MongoDB (singleton)
│   └── models/
│       └── SurveyResponse.ts  # Modelo Mongoose
├── pages/
│   ├── api/
│   │   ├── survey.ts       # POST /api/survey — guarda respuesta
│   │   └── stats.ts        # GET /api/stats — obtiene estadísticas
│   ├── _app.tsx
│   ├── _document.tsx
│   └── index.tsx           # Página principal de la encuesta
├── public/
│   ├── manifest.json       # Manifiesto PWA
│   └── icons/              # Íconos PWA (generar con el script)
├── scripts/
│   └── generate-icons.js   # Generador de íconos
├── styles/
│   └── globals.css         # Estilos globales + animaciones
├── .env.example
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

## Esquema MongoDB

```js
{
  visitSatisfaction: 'buena' | 'regular' | 'mala',
  clarityOfService: 'muy_claros' | 'regular' | 'nada_claros',
  suggestion: String,          // opcional, máx 1000 chars
  branch: String,              // nombre de sucursal
  createdAt: Date,             // automático (timestamps)
  updatedAt: Date,             // automático (timestamps)
}
```

## API Endpoints

### `POST /api/survey`
Guarda una respuesta de encuesta.

**Body:**
```json
{
  "visitSatisfaction": "buena",
  "clarityOfService": "muy_claros",
  "suggestion": "Todo estuvo excelente",
  "branch": "Principal"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Encuesta guardada exitosamente",
  "data": { ... }
}
```

### `GET /api/stats`
Obtiene estadísticas agregadas.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "visitStats": [{ "_id": "buena", "count": 120 }, ...],
    "clarityStats": [{ "_id": "muy_claros", "count": 130 }, ...],
    "recent": [ ... ]
  }
}
```

## Personalización

### Cambiar nombre de sucursal
En `.env.local`:
```
NEXT_PUBLIC_BRANCH_NAME=Sucursal Norte
```

### Cambiar tiempo de reset
En `components/ThankYouScreen.tsx`, línea del countdown:
```tsx
const [countdown, setCountdown] = useState(6); // cambiar a los segundos deseados
```

Y en `styles/globals.css`:
```css
animation: 'countdown 6s linear forwards', /* cambiar 6s */
```

## Licencia

Uso interno — Suzuki Concesionario.
