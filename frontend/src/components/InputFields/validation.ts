import { InputFieldControls, ValidationReason } from './useInputField'
import { getAsArray, SingleOrArray } from './util'

type FieldLike = Pick<InputFieldControls<any>, 'name' | 'type' | 'visible' | 'validate' | 'hasProblems'>

export type FieldConfiguration = SingleOrArray<FieldLike>[]

export const findErrorsInFields = async (
  fields: FieldConfiguration,
  reason: ValidationReason,
): Promise<boolean> => {
  const visibleFields = fields.flatMap(config => getAsArray(config)).filter(field => field.visible)
  let hasError = false
  for (const field of visibleFields) {
    const isFieldOK = await field.validate({ reason })
    hasError = hasError || !isFieldOK
  }
  return hasError
}

export const collectErrorsInFields = (fields: FieldConfiguration): boolean =>
  fields
    .flatMap(config => getAsArray(config))
    .filter(field => field.visible)
    .some(field => field.hasProblems)
