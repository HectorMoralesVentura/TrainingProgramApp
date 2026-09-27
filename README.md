# Training Program

Frontend en Nuxt 4 + Nuxt UI + TanStack Query + i18n (es/en), con la misma arquitectura que nexxus-app.

## Requisitos

- Node.js 22+
- pnpm 10.33.2 (`corepack enable`)
- Backend corriendo en `127.0.0.1:8020` (login en `/api/auth/login/`)

## Arranque

```bash
corepack enable
pnpm install          # corre `nuxt prepare` en postinstall
cp .env.example .env  # ajustar API_URL / API_PORT
pnpm dev              # http://localhost:9000
```

## Estructura (Scream Architecture)

```
app/
├── features/<feature>/{components,composables,schemas,types,utils}
├── pages/<ruta>/index.vue
├── plugins/          # $api (cliente HTTP) y Vue Query
└── shared/           # solo lo reutilizable en todo el proyecto
    ├── components/   # App*
    ├── composables/  # useAuth
    ├── utils/        # api.ts, error-message.util.ts
    ├── types/
    ├── layouts/      # default.vue, auth.vue
    └── i18n/locales/ # es.json, en.json
```

## Claude Code

- Skills en `.claude/skills/`: `scream-architecture`, `tanstack-query`, `i18n-bilingual`, `nuxt-ui-components` y `nuxt-ui` (oficial).
- MCP de Nuxt UI en `.mcp.json`.
- Verificación: abrir Claude Code y ejecutar `/skills`; `claude mcp list` debe mostrar `nuxt-ui`.

## VS Code

Extensiones recomendadas: Vue (Official) y Tailwind CSS IntelliSense.
