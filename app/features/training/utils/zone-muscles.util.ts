import { MUSCLE_IDS, ZONE_MUSCLES } from '~/features/training/utils/muscle-map.data'

/**
 * Mapa muscular de respaldo para una zona (por slug) cuando el backend aún no tiene `illustration_url`.
 * La tabla vive en scripts/muscle-map/zones.mjs, la misma que genera las imágenes que se suben a Firebase.
 * Devuelve null si la zona no se conoce (se muestra el ícono genérico).
 */
export function zoneMuscleMap(zoneSlug: string) {
  const zone = ZONE_MUSCLES[zoneSlug]
  if (!zone) return null
  return { ...zone, muscles: zone.muscles === 'all' ? [...MUSCLE_IDS] : zone.muscles }
}
