'use client'
import { useFormStatus } from 'react-dom'

interface Props {
  children: React.ReactNode
  pendingLabel?: string
  variant?: 'primary' | 'ghost' | 'danger' | 'safe' | 'info' | 'sos'
  size?: 'sm' | 'md' | 'lg'
  full?: boolean
  disabled?: boolean
  className?: string
  formAction?: (formData: FormData) => void
  name?: string
  value?: string
}

/**
 * Drop-in replacement for a plain <button type="submit"> inside a <form
 * action={serverAction}>. Uses useFormStatus so the button visibly disables
 * and shows a spinner while the action is in flight — real feedback instead
 * of a button that silently does nothing until the redirect lands.
 *
 * Supports `formAction` for forms with multiple submit targets (e.g.
 * Approve/Reject in one form). Note: useFormStatus reports pending for the
 * whole form regardless of which button triggered it, so in multi-button
 * forms every SubmitButton disables together — that's intentional, it
 * prevents a double-submit race, it just can't show which button was
 * actually clicked.
 */
export function SubmitButton({ children, pendingLabel, variant = 'primary', size = 'md', full, disabled, className = '', formAction, name, value }: Props) {
  const { pending } = useFormStatus()
  const isDisabled = pending || disabled
  const sizeCls = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : ''
  return (
    <button
      type="submit"
      formAction={formAction}
      name={name}
      value={value}
      disabled={isDisabled}
      className={`btn ${variant} ${sizeCls} ${full ? 'full' : ''} ${className}`.trim()}
    >
      {pending && <span className="spinner" aria-hidden="true" />}
      {pending ? (pendingLabel || 'Working…') : children}
    </button>
  )
}
