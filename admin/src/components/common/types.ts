/**
 * Type definitions for Common Components
 * Centralized types for better IDE support and type safety
 */

/**
 * Button component types
 */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'loading'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  ariaLabel?: string
  isLoading?: boolean
}

/**
 * Input component types
 */
export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time'

export interface InputProps {
  label?: string
  type?: InputType
  placeholder?: string
  modelValue?: string | number
  error?: string
  disabled?: boolean
  required?: boolean
  maxlength?: number
  minlength?: number
  autocomplete?: string
  id?: string
  helperText?: string
  isSuccess?: boolean
  ariaDescription?: string
}

/**
 * Card component types
 */
export type CardPadding = 'sm' | 'md' | 'lg'

export interface CardProps {
  title?: string
  padding?: CardPadding
  showHeaderBorder?: boolean
  showFooterBorder?: boolean
  class?: string
  ariaLabel?: string
}

/**
 * Modal component types
 */
export interface ModalProps {
  isOpen: boolean
  title: string
  closeOnBackdropClick?: boolean
  showCloseButton?: boolean
  zIndex?: number
  ariaLabel?: string
  ariaDescription?: string
  disableEscapeClose?: boolean
  lockBodyScroll?: boolean
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Alert component types
 */
export type AlertType = 'success' | 'error' | 'warning' | 'info'

export interface AlertProps {
  type: AlertType
  title?: string
  message?: string
  dismissible?: boolean
  autoDismiss?: boolean
  autoDismissMs?: number
  visible?: boolean
  icon?: string
  ariaLabel?: string
}

/**
 * Utility types
 */
export interface ValidationError {
  field: string
  message: string
}

export interface FormState {
  [key: string]: string | number | boolean
}
