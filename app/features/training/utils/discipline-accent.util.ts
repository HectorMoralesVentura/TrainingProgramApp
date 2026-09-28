// Clases completas (no interpoladas) para que Tailwind las detecte.
const ACCENTS: Record<string, string> = {
  gym: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  crossfit: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  yoga: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
}

/** Disciplinas futuras usan el color primario hasta que se les asigne uno. */
export function disciplineAccent(slug: string): string {
  return ACCENTS[slug] ?? 'bg-primary/10 text-primary'
}
