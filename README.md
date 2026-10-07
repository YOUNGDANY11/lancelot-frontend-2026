# Lancelot · Frontend

Interfaz web de **Lancelot**, la plataforma de seguimiento y análisis integral del deportista en fútbol y fútbol sala. Es el trabajo de grado de Ingeniería de Software de la Universidad de Cundinamarca (2026). El club **VERA FC** la valida en condiciones operativas reales.

El backend (NestJS) está en `../backend` y es la fuente de verdad del contrato de la API.

## Requisitos

- Node.js 20.19 o superior (probado con Node 24).
- El backend en ejecución, por defecto en `http://localhost:3000/api`.

## Puesta en marcha

```bash
npm install
cp .env.example .env
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`, el origen que el backend acepta por CORS.

## Variables de entorno

| Variable       | Valor por defecto           | Uso                                       |
| -------------- | --------------------------- | ----------------------------------------- |
| `VITE_API_URL` | `http://localhost:3000/api` | URL base de la API, con el prefijo `/api` |

Solo se exponen al navegador las variables con prefijo `VITE_`.

## Scripts

| Script                  | Qué hace                                                       |
| ----------------------- | -------------------------------------------------------------- |
| `npm run dev`           | Servidor de desarrollo con recarga en caliente                 |
| `npm run build`         | Revisión de tipos y compilación de producción en `dist/`       |
| `npm run preview`       | Sirve la compilación de producción                             |
| `npm run lint`          | ESLint y verificación de que no haya comentarios en el código  |
| `npm run lint:comments` | Solo la verificación de comentarios                            |
| `npm run format`        | Formatea con Prettier (incluye el orden de clases de Tailwind) |
| `npm run test`          | Pruebas con Vitest y Testing Library                           |

## Tecnologías

- React 19, Vite y TypeScript en modo estricto.
- Tailwind CSS v4 y shadcn/ui (Radix), con iconos de `lucide-react`.
- React Router v7, TanStack Query y axios.
- react-hook-form con zod para formularios.
- Recharts mediante los gráficos de shadcn/ui.
- `motion` para animaciones, siempre respetando `prefers-reduced-motion`.
- `sonner`, `date-fns` (locale `es`) y `jwt-decode`.

## Estructura

```
src/
├── assets/          Marca (brand/) y fotos del equipo (team/)
├── components/
│   ├── ui/          Componentes de shadcn/ui, sin lógica de negocio
│   ├── layout/      AppShell, navegación, barra superior
│   ├── common/      Piezas reutilizables (estados, insignias, tablas)
│   ├── charts/      Gráficos reutilizables
│   ├── landing/     Secciones de la página pública
│   ├── auth/        Modales de inicio de sesión y registro
│   └── modules/     Piezas propias de cada módulo
├── constants/       Etiquetas en español, enums, glosario, navegación
├── context/         Sesión, contexto de temporada y categoría, tema
├── controllers/     Un hook controlador por módulo
├── hooks/           Hooks genéricos
├── lib/             Cliente HTTP, React Query, utilidades base
├── routes/          Enrutador y guardas de rol
├── schemas/         Esquemas zod alineados con los DTOs
├── services/        Llamadas HTTP tipadas, una por recurso
├── styles/          Tokens del tema y utilidades de Tailwind
├── test/            Configuración de las pruebas
├── types/           Tipos de entidades y respuestas
├── utils/           Formato, errores, almacenamiento del token
└── views/           Páginas: landing/, app/ y errors/
```

## Convenciones

- **Sin comentarios** en ningún archivo de código ni de configuración. `npm run lint` lo verifica.
- **Flujo de dependencias:** vista → controlador → servicio → `apiClient`. ESLint impide que una vista o un componente importe axios, `apiClient` o un servicio.
- **Idioma:** identificadores en inglés y todo texto visible en español de Colombia.
- **Textos centralizados** en `src/constants/`.
- **Datos sensibles:** en el navegador solo se guardan el refresh token, la preferencia de tema y la temporada y categoría elegidas. Nunca datos de salud ni personales (Ley 1581 de 2012).
- **Contenido honesto:** no se inventan datos, métricas ni testimonios. Los gráficos de ejemplo de la landing van marcados como "ilustrativo".

## Calidad y accesibilidad

- **Responsive desde 360 px.** En pantallas angostas las tablas se muestran como tarjetas y los paneles laterales ocupan todo el ancho. El registro de RPE y la bandeja de alertas están pensados primero para el celular.
- **Accesibilidad.** `src/test/accessibility.test.tsx` revisa con `axe-core` las pantallas principales de cada rol: landmarks, encabezados, nombres accesibles y formularios. Los botones que solo tienen ícono llevan `aria-label` y los modales atrapan el foco y se cierran con Esc.
- **Rendimiento.** Cada vista, el AppShell, los paneles de inicio por rol y los formularios de acceso se cargan en diferido, de modo que quien visita la landing no descarga la aplicación privada.

## Tema

El tema oscuro es el principal y el claro está disponible desde el selector. Los tokens están en `src/styles/index.css` como variables CSS del tema de shadcn/ui. Los niveles de riesgo nunca dependen solo del color: siempre llevan icono y texto.

## Equipo

- Daniel José Morales Teatino: Dev Backend - AI ML
- Lukas David Dávila Álzate: Dev Frontend
- Docente asesora: Angélica Gaitán Nuñez

Universidad de Cundinamarca · Facultad de Ingeniería · Programa de Ingeniería de Software · 2026
