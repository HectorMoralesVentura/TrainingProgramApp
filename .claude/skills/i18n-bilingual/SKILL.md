---
name: i18n-bilingual
description: >-
  Enforce fully bilingual UI (Spanish + English) in this Nuxt project. Every
  user-facing string must exist in both es.json and en.json with no exceptions.
  Use when adding or editing UI copy, labels, placeholders, toasts, validation
  messages, empty states, modals, buttons, or any visible text in features or
  shared components.
---

# i18n bilingüe (Training Program)

La app debe ser **totalmente bilingüe** en español e inglés. Sin excepciones.

## Regla absoluta

1. **Toda** cadena visible al usuario va por `useI18n()` / `$t(...)`.
2. Cada clave nueva se agrega en **ambos** archivos:
   - `app/shared/i18n/locales/es.json`
   - `app/shared/i18n/locales/en.json`
3. Prohibido hardcodear texto de UI en componentes, composables, toasts o schemas (mensajes de error incluidos).
4. Si una feature agrega copy, esa feature queda incompleta hasta tener ES + EN.

## Dónde viven las traducciones

```
app/shared/i18n/locales/
├── es.json
└── en.json
```

Agrupar por dominio/feature en el JSON (`tasks.*`, `auth.*`, `sidebar.*`, etc.). No inventar archivos de locale por feature.

## Cómo escribir claves

- Namespace por feature: `tasks.processStart.submit`, `auth.login.title`.
- Misma estructura de árbol en `es.json` y `en.json` (mismas claves, mismo anidamiento).
- Preferir claves semánticas (`submit`, `empty`, `loadError`) sobre el texto literal.
- Interpolación con la API de vue-i18n: `t('tasks.due.inDays', { n: 3 })`.

## Checklist al tocar UI

- [ ] ¿Hay texto nuevo o cambiado? → claves en `es.json` **y** `en.json`
- [ ] ¿Toasts / validación / placeholders / aria-labels? → también i18n
- [ ] ¿El componente usa `t('...')` o `$t('...')` en vez de string literal?
- [ ] ¿Las claves existen en ambos locales con el mismo path?

## Ejemplos

```vue
<!-- ✅ -->
<UButton :label="t('tasks.processStart.submit')" />

<!-- ❌ -->
<UButton label="En Proceso" />
```

```ts
// ✅ toast bilingüe
toast.add({
  title: t('tasks.processStart.successTitle'),
  description: t('tasks.processStart.successDescription'),
  color: 'success',
})

// ❌
toast.add({ title: 'Proceso iniciado', color: 'success' })
```

## Al crear o extender una feature

1. Definir todas las claves de copy de la feature.
2. Escribir las entradas en `es.json`.
3. Escribir las entradas equivalentes en `en.json` (traducción completa, no dejar español en EN ni viceversa).
4. Consumir solo esas claves en la UI.

Si falta un idioma, la tarea **no está terminada**.
