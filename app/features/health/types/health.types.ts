export type ConditionCategory = 'injury' | 'medical' | 'disability'
export type ConditionSeverity = 'mild' | 'moderate' | 'severe'

export interface MedicalCondition {
  id: number
  slug: string
  name: string
  description: string
  category: ConditionCategory
}

export interface AffectedZone {
  id: number
  slug: string
  name: string
  discipline: string
}

export interface UserCondition {
  id: number
  condition: MedicalCondition
  severity: ConditionSeverity
  notes: string
  started_at: string | null
  affected_zones: AffectedZone[]
  created_at: string
}

export interface UserConditionPayload {
  condition: string
  severity?: ConditionSeverity
  notes?: string
  started_at?: string | null
  /** ids de zonas que el usuario quiere excluir completas. */
  affected_zones?: number[]
}
