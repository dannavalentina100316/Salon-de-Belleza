<template>
  <Teleport to="body">
    <Transition name="toast">
      <aside
        v-if="feedbackState.toast"
        class="feedback-toast"
        :class="`toast-${feedbackState.toast.type}`"
        role="status"
        aria-live="polite"
      >
        <span class="toast-icon" aria-hidden="true">{{ iconFor(feedbackState.toast.type) }}</span>
        <p>{{ feedbackState.toast.message }}</p>
        <BaseButton
          variant="ghost"
          size="small"
          aria-label="Cerrar notificación"
          @click="dismissToast"
        >
          ×
        </BaseButton>
      </aside>
    </Transition>

    <Transition name="dialog">
      <div
        v-if="feedbackState.confirmation"
        class="feedback-backdrop"
        @click.self="resolveConfirmation(false)"
      >
        <section
          class="feedback-dialog"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="feedback-dialog-title"
          aria-describedby="feedback-dialog-message"
          @keydown.esc="resolveConfirmation(false)"
        >
          <span class="dialog-icon" :class="`icon-${feedbackState.confirmation.tone}`" aria-hidden="true">
            {{ feedbackState.confirmation.tone === 'warning' ? '!' : '?' }}
          </span>
          <h2 id="feedback-dialog-title">{{ feedbackState.confirmation.title }}</h2>
          <p id="feedback-dialog-message">{{ feedbackState.confirmation.message }}</p>
          <div class="dialog-actions">
            <BaseButton
              variant="secondary"
              class="dialog-cancel"
              @click="resolveConfirmation(false)"
            >
              {{ feedbackState.confirmation.cancelText }}
            </BaseButton>
            <BaseButton
              class="dialog-confirm"
              :variant="feedbackState.confirmation.tone === 'danger' ? 'danger' : 'primary'"
              :class="`confirm-${feedbackState.confirmation.tone}`"
              @click="resolveConfirmation(true)"
            >
              {{ feedbackState.confirmation.confirmText }}
            </BaseButton>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import BaseButton from './BaseButton.vue'
import {
  dismissToast,
  feedbackState,
  resolveConfirmation,
} from '../services/feedback'

function iconFor(type) {
  return ({
    success: '✓',
    error: '×',
    warning: '!',
    info: 'i',
  })[type] || 'i'
}

function handleEscape(event) {
  if (event.key === 'Escape' && feedbackState.confirmation) {
    resolveConfirmation(false)
  }
}

onMounted(() => window.addEventListener('keydown', handleEscape))
onBeforeUnmount(() => window.removeEventListener('keydown', handleEscape))
</script>

<style scoped>
.feedback-toast {
  position: fixed;
  z-index: 3000;
  top: 22px;
  right: 22px;
  display: flex;
  align-items: center;
  gap: 12px;
  width: min(390px, calc(100vw - 32px));
  padding: 14px 15px;
  border: 1px solid #e8d8d8;
  border-radius: 12px;
  background: #fffdfb;
  box-shadow: 0 12px 35px #39262e20;
  color: #62464e;
}

.toast-icon,
.dialog-icon {
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #e9f3e6;
  color: #476d46;
  font-weight: 700;
}

.toast-error .toast-icon,
.icon-danger {
  background: #f9e8e6;
  color: #a13e36;
}

.toast-warning .toast-icon,
.icon-warning {
  background: #fbf1dc;
  color: #8b6f3c;
}

.toast-info .toast-icon {
  background: #f8e9e9;
  color: #82485b;
}

.feedback-toast p {
  flex: 1;
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
}

.feedback-backdrop {
  position: fixed;
  z-index: 3100;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  background: #39262e75;
}

.feedback-dialog {
  width: min(440px, 100%);
  padding: 30px;
  border: 1px solid #f0e2e1;
  border-radius: 16px;
  background: #fffdfb;
  box-shadow: 0 20px 70px #39262e35;
  text-align: center;
}

.dialog-icon {
  width: 44px;
  height: 44px;
  margin: 0 auto 15px;
  background: #f8e9e9;
  color: #82485b;
  font-family: Georgia, serif;
  font-size: 23px;
}

.feedback-dialog h2 {
  margin: 0;
  color: #503a40;
  font-family: Georgia, serif;
  font-size: 23px;
  font-weight: normal;
}

.feedback-dialog p {
  margin: 12px 0 24px;
  color: #89757a;
  font-size: 13px;
  line-height: 1.6;
}

.dialog-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.dialog-actions .base-button {
  min-width: 115px;
}

.dialog-confirm {
  border-color: #82485b !important;
}

.confirm-danger {
  border-color: #a13e36 !important;
}

.confirm-warning {
  border-color: #8b6f3c !important;
}

.toast-enter-active,
.toast-leave-active,
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

@media (max-width: 480px) {
  .feedback-toast {
    top: 12px;
    right: 12px;
  }

  .feedback-dialog {
    padding: 25px 20px;
  }
}
</style>
