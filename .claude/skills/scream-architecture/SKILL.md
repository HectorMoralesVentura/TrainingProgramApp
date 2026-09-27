---
name: scream-architecture
description: >-
  Enforces this Nuxt 4 project's Scream Architecture. Pages use folder-per-route
  (each route is a folder with index.vue) and features live under
  app/features/<feature>/ with components/composables/schemas/types/utils
  subfolders. Growing features split by subdomain (workspace, list, kanban,
  form…). Code goes to app/shared/ ONLY when reusable across the whole project.
  Use when creating, moving, or organizing pages, components, composables,
  utils, types, or schemas in this repo.
---

# Scream Architecture (Training Program)

Organize code by **domain/feature**, not by technical type. The folder structure should "scream" what the app does. Apply **KISS** and SOLID.

## The one rule for `shared`

Something goes to `app/shared/` **only if it is reusable across the whole project**. If it belongs to a single feature, it lives inside that feature. There is no `app/features/shared/` at the features root — project-wide code always goes to the top-level `app/shared/`.

Decision when creating a file:

1. Is it tied to one domain/feature? → `app/features/<feature>/...`
2. Is it truly reusable everywhere (auth, api, generic UI, generic utils, global types)? → `app/shared/...`

## Pages: folder-per-route

Every route is a folder containing `index.vue` (co-locate route-specific pieces next to it).

```
app/pages/
├── index.vue              # route "/"
├── tasks/index.vue        # route "/tasks"
├── dashboard/index.vue    # route "/dashboard"
└── settings/index.vue     # route "/settings"
```

Route-specific components/composables that are NOT reusable go in the feature (preferred) or beside the page. Do not push page-specific code to `app/shared/`.

## Features: folder-per-feature

Each feature gets its own folder under `app/features/<feature>/`, with the technical subfolders it needs (create only the ones with content):

```
app/features/<feature>/
├── components/     # feature-only Vue components
├── composables/    # useXxx() feature logic
├── schemas/        # zod schema factories
├── types/          # feature interfaces/types
└── utils/          # feature-only helpers
```

Small feature example (flat is fine):

```
app/features/projects/
├── composables/useProjects.ts
└── types/project.types.ts
```

## Growing features: subdominios (KISS)

When a feature grows and a flat `components/` / `composables/` becomes hard to navigate, **split by subdomain inside the feature** — do not invent new top-level features just to tidy folders.

Test: *“If I delete subdomain X tomorrow, which folder goes away entirely?”* That folder is the subdomain.

### When to split

- Split when files mix unrelated concerns (shell, list, kanban, form…) and navigation suffers.
- **Do not** split a small feature early.
- **Do not** extract a top-level `app/features/kanban` (etc.) while it still shares shell, filters, types, and create/detail with the parent feature.

### Layout inside a large feature

Mirror the same technical folders under each subdomain. Use `shared/` **only inside the feature** for pieces used by 2+ subdomains of that feature (not app-wide).

```
app/features/<feature>/
├── components/
│   ├── workspace/     # shell, filters, view switchers
│   ├── list/
│   ├── kanban/
│   ├── calendar/
│   ├── form/          # create / detail / process modals
│   └── shared/        # UI reused across THIS feature’s subdomains
├── composables/
│   ├── workspace/
│   ├── list/
│   ├── kanban/
│   ├── calendar/
│   ├── form/
│   └── shared/        # api helpers, dropdowns, presentation shared in-feature
├── utils/
│   ├── form/
│   ├── kanban/
│   ├── calendar/
│   └── *.util.ts      # cross-subdomain utils can stay at utils/ root
└── types/
    └── <feature>.types.ts   # split types only when the file hurts; KISS first
```

Reference: apply this layout to any feature once it grows (e.g. a future `app/features/programs/`).

### Naming of subdomains

Use short domain names (`workspace`, `list`, `kanban`, `form`), not technical junk (`ui`, `hooks`, `helpers` as catch-alls). Prefer clarity over clever nesting (one level of subdomain is enough).

### Checklist for new files in a large feature

1. Which subdomain owns this? → put it there.
2. Used by 2+ subdomains of the same feature? → `components/shared/` or `composables/shared/`.
3. Used by multiple features / the whole app? → `app/shared/`.
4. Keep types flat until a single `*.types.ts` becomes painful.

## `app/shared/` layout (project-wide only)

```
app/shared/
├── components/     # reusable across the app (prefix "App*", e.g. AppSidebar)
├── composables/    # useAuth, useApi, useSidebar...
├── utils/          # api.ts, error-message.util.ts, initials.ts...
├── types/          # auth.types.ts...
├── layouts/        # default.vue, auth.vue (dir.layouts override)
└── i18n/locales/   # es.json, en.json
```

## Auto-imports & config (from `nuxt.config.ts`)

- Auto-imported dirs (no import statement needed): `shared/composables`, `shared/utils`, `features/**/composables/**`, `features/**/schemas/**`, `features/**/utils/**`. Also `z` from zod. The trailing `/**` is required so subdomain folders (`composables/workspace/`, `utils/form/`, …) are scanned.
- Components: `~/shared/components` are registered **without prefix**; `~/features/**/components/**` are registered **with path prefix**.
- Layouts live in `app/shared/layouts` (via `dir.layouts`).
- **Types are NOT auto-imported** — import them explicitly, e.g. `import type { Project } from '~/features/projects/types/project.types'`.

## Naming conventions

- Composables: `useXxx.ts` exporting `useXxx()`.
- Schemas: `*.schema.ts` (export a `createXxxSchema()` factory + inferred type).
- Types: `*.types.ts`.
- Utils: `*.util.ts` (or a descriptive `name.ts`).
- Shared components: `App*` (e.g. `AppSidebar.vue`, `AppToolbar.vue`).

## Comments

Business logic comments in Spanish; keep them minimal (explain intent/constraints, not the obvious). No emojis unless requested.
