/** Formatea fechas del backend según el idioma activo. */
export function useDateFormat() {
  const { locale } = useI18n()

  function formatDate(value: string | null | undefined, options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }) {
    if (!value) return ''
    // Las fechas "AAAA-MM-DD" se interpretan como locales para que no se recorran un día por la zona horaria.
    const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value)
    return new Intl.DateTimeFormat(locale.value, options).format(date)
  }

  /** Fecha de hoy como "AAAA-MM-DD" en hora local. */
  function today() {
    const now = new Date()
    const offset = now.getTimezoneOffset() * 60_000
    return new Date(now.getTime() - offset).toISOString().slice(0, 10)
  }

  return { formatDate, today }
}
