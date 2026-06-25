/**
 * Common Components Library
 * Re-exports all reusable foundation components
 *
 * Usage:
 * import { Button, Input, Card, Modal, Alert } from '@/components/common'
 *
 * Or import individually:
 * import Button from '@/components/common/Button.vue'
 */

export { default as Button } from './Button.vue'
export { default as Input } from './Input.vue'
export { default as Card } from './Card.vue'
export { default as Modal } from './Modal.vue'
export { default as Alert } from './Alert.vue'

// Re-export types
export type { ButtonVariant, ButtonSize } from './Button.vue'
export type { InputType } from './Input.vue'
export type { CardPadding } from './Card.vue'
export type { AlertType } from './Alert.vue'
