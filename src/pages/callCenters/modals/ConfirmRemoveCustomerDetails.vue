<template>
  <VaModal
    :model-value="modelValue"
    hide-default-actions
    size="medium"
    @update:modelValue="(val) => emit('update:modelValue', val)"
  >
    <template #header>
      <!-- <h3 class="font-semibold text-md">Confirmation</h3> -->
    </template>

    <div class="text-sm">Are you sure you want to remove the Customer Details?</div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <VaButton size="medium" @click="emit('update:modelValue', false)">Cancel</VaButton>
        <VaButton color="danger" size="medium" @click="onYes">Yes</VaButton>
      </div>
    </template>
  </VaModal>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, required: true },
})
const emit = defineEmits(['update:modelValue', 'confirm'])

function onYes() {
  emit('confirm') // tell parent to clear
  emit('update:modelValue', false) // close modal
}
</script>
