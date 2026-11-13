import { reactive } from 'vue'

export const feedbackState = reactive({
  toast: null,
  confirmation: null,
})

let toastTimer
let confirmationResolver
let nextId = 0

export function notify(message, type = 'success') {
  const id = ++nextId
  feedbackState.toast = { id, message, type }
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    if (feedbackState.toast?.id === id) feedbackState.toast = null
  }, 4500)
}

export function dismissToast() {
  clearTimeout(toastTimer)
  feedbackState.toast = null
}

export function confirmAction({
  title = '¿Confirmas esta acción?',
  message = '',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  tone = 'danger',
} = {}) {
  if (confirmationResolver) confirmationResolver(false)

  feedbackState.confirmation = {
    id: ++nextId,
    title,
    message,
    confirmText,
    cancelText,
    tone,
  }

  return new Promise(resolve => {
    confirmationResolver = resolve
  })
}

export function resolveConfirmation(confirmed) {
  if (!confirmationResolver) return

  const resolve = confirmationResolver
  confirmationResolver = null
  feedbackState.confirmation = null
  resolve(confirmed)
}
