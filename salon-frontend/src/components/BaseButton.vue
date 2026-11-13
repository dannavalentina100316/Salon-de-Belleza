<template>
  <component
    :is="to ? RouterLink : 'button'"
    v-bind="$attrs"
    :to="to || undefined"
    :type="to ? undefined : type"
    :disabled="to ? undefined : disabled || loading"
    :class="['base-button', `button-${variant}`, `button-${size}`, { 'is-loading': loading }]"
    :style="color ? { backgroundColor: color, borderColor: color } : undefined"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="button-spinner" aria-hidden="true"></span>
    <span v-else-if="icon" class="button-icon" aria-hidden="true">{{ icon }}</span>
    <slot>{{ label }}</slot>
  </component>
</template>

<script setup>
import { RouterLink } from 'vue-router'

defineOptions({ inheritAttrs: false })

defineProps({
  label: {
    type: String,
    default: 'soy un boton sin label',
  },
  variant: {
    type: String,
    default: 'primary',
    validator: value => ['primary', 'secondary', 'danger', 'success', 'ghost'].includes(value),
  },
  size: {
    type: String,
    default: 'medium',
    validator: value => ['small', 'medium', 'large'].includes(value),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'button',
    validator: value => ['button', 'submit', 'reset'].includes(value),
  },
  icon: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: '',
  },
  to: {
    type: [String, Object],
    default: null,
  },
})

defineEmits(['click'])
</script>

<style scoped>
.base-button {
  min-width: 0;
  min-height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 9px 13px;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  line-height: 1.25;
  text-align: center;
  transition: background-color 0.16s ease, border-color 0.16s ease, color 0.16s ease;
}

.button-primary {
  background: #82485b;
  color: #fff;
}

.button-primary:hover:not(:disabled) {
  background: #663748;
}

.button-secondary {
  border-color: #eadbdc;
  background: #fffdfb;
  color: #805061;
}

.button-secondary:hover:not(:disabled),
.button-ghost:hover:not(:disabled) {
  background: #f8e9e9;
}

.button-danger {
  border-color: #f0d4cf;
  background: #fffdfb;
  color: #a13e36;
}

.button-danger:hover:not(:disabled) {
  background: #fff0ed;
}

.button-success {
  background: #e9f3e6;
  color: #476d46;
}

.button-ghost {
  background: transparent;
  color: #805061;
}

.button-small {
  min-height: 30px;
  padding: 6px 9px;
  font-size: 11px;
}

.button-large {
  min-height: 42px;
  padding: 12px 17px;
}

.base-button:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.button-icon {
  line-height: 1;
}

.button-spinner {
  width: 13px;
  height: 13px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: button-spin 0.7s linear infinite;
}

@keyframes button-spin {
  to { transform: rotate(360deg); }
}
</style>
