import React, { FC, useCallback } from 'react'
import { TextArrayControls } from './useTextArrayField'
import classes from './index.module.css'
import { StringUtils } from '../../utils/string.utils'
import { ProblemList } from './ProblemDisplay'
import { checkProblems } from './util'
import { SpinnerIcon } from '../icons/SpinnerIcon'
import { CheckCircleIcon } from '../icons/CheckCircleIcon'

const TrashIcon: FC<{
  label: string
  remove: () => void
  enabled?: boolean
}> = ({ label, remove, enabled }) => {
  const handleClick = useCallback(() => {
    if (enabled) remove()
  }, [remove])
  return (
    <div title={label} className={classes.removeIcon} onClick={handleClick}>
      <svg width="14" height="19" viewBox="0 0 14 19" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M1 16.5C1 17.6 1.9 18.5 3 18.5H11C12.1 18.5 13 17.6 13 16.5V4.5H1V16.5ZM14 1.5H10.5L9.5 0.5H4.5L3.5 1.5H0V3.5H14V1.5Z"
          fill="#323232"
        />
      </svg>
    </div>
  )
}

const AddIcon: FC<{
  label: string
  add: () => void
  enabled?: boolean
  title?: string
}> = ({ label, add, enabled, title }) => {
  const handleClick = useCallback(() => {
    if (enabled) add()
  }, [add])
  return (
    <div className={StringUtils.clsx('niceLine', classes.addIcon)} title={title} onClick={handleClick}>
      <svg width="28" height="25" viewBox="0 0 28 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_2028_18630)">
          <path
            d="M12 2.5C6.48 2.5 2 6.98 2 12.5C2 18.02 6.48 22.5 12 22.5C17.52 22.5 22 18.02 22 12.5C22 6.98 17.52 2.5 12 2.5ZM17 13.5L13 13.5L13 17.5H11L11 13.5L7 13.5L7 11.5H11L11 7.5H13L13 11.5H17V13.5Z"
            fill="#130FFF"
          />
        </g>
        <defs>
          <clipPath id="clip0_2028_18630">
            <rect width="24" height="24" fill="white" transform="translate(0 0.5)" />
          </clipPath>
        </defs>
      </svg>
      {label}
    </div>
  )
}

export const TextArrayInput: FC<TextArrayControls> = ({
  name,
  label,
  description,
  value,
  placeholders,
  setItem,
  canAddItem,
  canRemoveItem,
  addItemLabel,
  addItem,
  removeItemLabel,
  removeItem,
  allProblems,
  clearProblem,
  visible,
  enabled,
  whyDisabled,
  validationPending,
  validationStatusMessage,
  pendingValidationIndex,
  indicateValidationSuccess,
  isValidated,
  hasProblems,
}) => {
  const handleChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) =>
    setItem(index, event.target.value)

  if (!visible) return

  const rootProblems = allProblems['root'] ?? []

  const wrappedField = (
    <div className={classes.textArrayValue}>
      <ProblemList problems={rootProblems} onRemove={clearProblem} />
      {validationPending && pendingValidationIndex === undefined && (
        <div className={'niceLine'}>
          {validationStatusMessage}
          <SpinnerIcon width={24} height={24} spinning={true} />
        </div>
      )}
      {value.map((value, index) => {
        const itemProblems = allProblems[`value-${index}`] || []
        const { hasError, hasWarning } = checkProblems(itemProblems)

        // Determine if we can be sure that this item is fully OK

        // The difficulty here is that when finding an error,
        // we stop executing the validators, so this means that
        // having no problems reported locally can also be the result of
        // not all validators being executed.
        // For now, the best we can do is look at _all_ errors, not only local errors.
        // This way, we can only checkmark items when all items are OK.
        //
        // Improving this would entitle:
        // - Extending the validator type with meta-info about which items
        //   will a validator check
        // - Executing the validators in a sorted order, so that we
        //   can completely check some fields before going into others
        // - Pass info as part of the controls about which fields have been
        //   completely validated

        const knownGood = isValidated && !hasProblems

        return (
          <div
            key={`edit-${index}`}
            className={StringUtils.clsx(
              classes.textValue,
              hasError ? classes.fieldWithError : hasWarning ? classes.fieldWithWarning : '',
            )}
          >
            <div className={'niceLine'}>
              <input
                name={name}
                key={`edit-${index}`}
                placeholder={placeholders[index]}
                value={value}
                onChange={event => handleChange(index, event)}
                className={classes.textValue}
                disabled={!enabled}
                title={whyDisabled}
              />
              {pendingValidationIndex === index && <SpinnerIcon width={24} height={24} spinning={true} />}
              {indicateValidationSuccess && knownGood && <CheckCircleIcon />}
              {canRemoveItem(index) && (
                <TrashIcon
                  enabled={enabled}
                  label={whyDisabled ?? removeItemLabel}
                  remove={() => removeItem(index)}
                />
              )}
            </div>
            <ProblemList problems={itemProblems} onRemove={clearProblem} />
          </div>
        )
      })}
      {canAddItem && <AddIcon label={addItemLabel} add={addItem} enabled={enabled} title={whyDisabled} />}
    </div>
  )

  return (
    <div className={classes.fieldContainer}>
      {label ? (
        <label>
          <div className={classes.fieldLabel}>{label}</div>
          <div className={classes.fieldDescription}>{description}</div>
          {wrappedField}
        </label>
      ) : (
        wrappedField
      )}
    </div>
  )
}
