import { Sheet } from './Sheet'

export interface ReferencesDefinitionResult {
  sheet: Sheet
  definition: ReferencesDefinition
}

export interface ReferenceQueryResult {
  sheet: Sheet
  id: string
  record: any
}

export type ExpressionResult = [number | null, Error | null]


