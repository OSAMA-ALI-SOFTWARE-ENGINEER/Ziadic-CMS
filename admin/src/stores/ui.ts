import { defineStore } from 'pinia'

export type ToastTone = 'success' | 'warning' | 'danger' | 'info'

type Toast = {
  id: number
  message: string
  tone: ToastTone
}

export const useUiStore = defineStore('ui', {
  state: () => ({
    toasts: [] as Toast[],
  }),
  actions: {
    pushToast(message: string, tone: ToastTone = 'success') {
      const toast = { id: Date.now() + Math.random(), message, tone }
      this.toasts.push(toast)
      window.setTimeout(() => this.dismissToast(toast.id), 3200)
    },
    dismissToast(id: number) {
      this.toasts = this.toasts.filter((toast) => toast.id !== id)
    },
  },
})
