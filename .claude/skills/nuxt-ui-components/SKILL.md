---
name: nuxt-ui-components
description: >-
  Prefiere componentes de Nuxt UI (@nuxt/ui) sobre elementos HTML nativos al
  crear o editar UI en este proyecto Vue/Nuxt. Usar al maquetar formularios,
  botones, inputs, selects, badges, alerts, modales, slideovers, tabs, o
  cualquier control interactivo. Excepción: div/span para layout y nativos solo
  cuando Nuxt UI no cubra el caso.
---

# Nuxt UI primero (Training Program)

A partir de ahora, la UI interactiva debe construirse con **componentes de Nuxt UI**, no con HTML nativo.

## Regla

1. **Por defecto**: usar `U*` de `@nuxt/ui` (`UButton`, `UInput`, `USelect`, `UTextarea`, `UForm`, `UFormField`, `USwitch`, `UBadge`, `UAlert`, `USlideover`, `UModal`, `UTabs`, `USkeleton`, `UIcon`, etc.).
2. **Permitido nativo**: `div`, `span`, `template`, `section`/`main`/`header`/`footer`/`nav` solo como contenedores semánticos de layout.
3. **Nativo solo si es necesario**: cuando Nuxt UI no ofrezca equivalente razonable (p. ej. `canvas`, `video`, o un patrón de drag-and-drop muy específico). Justificar en un comentario breve en español.

## Sustituciones habituales

| Evitar | Preferir |
|--------|----------|
| `<button>` | `UButton` |
| `<input>` | `UInput` / `UInputNumber` / `UPinInput` |
| `<textarea>` | `UTextarea` |
| `<select>` | `USelect` / `USelectMenu` |
| `<form>` | `UForm` + `UFormField` |
| checkbox / radio nativos | `UCheckbox` / `URadioGroup` / `USwitch` |
| `<a>` de acción | `UButton` (`to` / `href`) o `ULink` |
| badges / chips caseros | `UBadge` / `UChip` |
| alertas / toasts caseros | `UAlert` / `useToast` |
| iconos SVG inline | `UIcon` (`i-lucide-*`) |

## Formularios

- Envolver campos con `UForm` + `UFormField`.
- Labels, `required`, `help` y errores van en `UFormField`, no en `<label>`/`<p>` sueltos.
- En vistas **detail / view-only**: `disabled` en controles y **sin** `required` (p. ej. `:required="!isDetailView"`).

## Layout

- Contenedores (`div`/`section`) + utilidades Tailwind: OK.
- Controles y feedback visual: Nuxt UI.
- No reinventar botones, inputs o selects con clases Tailwind sobre HTML nativo.

## Checklist rápido

- [ ] ¿Hay un `U*` equivalente? → usarlo
- [ ] ¿Es solo layout? → `div`/`span` OK
- [ ] ¿No hay equivalente? → nativo + comentario breve del porqué
