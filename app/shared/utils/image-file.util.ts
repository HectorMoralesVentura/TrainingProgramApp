export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp'
export const MAX_IMAGE_MB = 5

/** Validación previa a subir (el backend vuelve a validar). Devuelve la clave i18n del error o null. */
export function imageFileErrorKey(file: File): string | null {
  if (!IMAGE_ACCEPT.split(',').includes(file.type)) return 'files.errors.type'
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) return 'files.errors.size'
  return null
}
