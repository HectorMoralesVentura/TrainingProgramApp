import type { ConditionCategory, ConditionSeverity } from '~/features/health/types/health.types'

export const CONDITION_CATEGORIES: { value: ConditionCategory, icon: string }[] = [
  { value: 'injury', icon: 'i-lucide-bandage' },
  { value: 'medical', icon: 'i-lucide-heart-pulse' },
  { value: 'disability', icon: 'i-lucide-accessibility' },
]

export const CONDITION_SEVERITIES: { value: ConditionSeverity, color: 'success' | 'warning' | 'error' }[] = [
  { value: 'mild', color: 'success' },
  { value: 'moderate', color: 'warning' },
  { value: 'severe', color: 'error' },
]

export function conditionCategoryIcon(category: ConditionCategory) {
  return CONDITION_CATEGORIES.find(c => c.value === category)?.icon ?? 'i-lucide-heart-pulse'
}

export function conditionSeverityColor(severity: ConditionSeverity) {
  return CONDITION_SEVERITIES.find(s => s.value === severity)?.color ?? 'warning'
}
