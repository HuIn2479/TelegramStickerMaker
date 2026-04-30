<template>
  <div class="segmented-tabs" role="tablist">
    <button
      v-for="item in items"
      :key="item.key"
      type="button"
      :class="{ active: item.key === modelValue }"
      role="tab"
      @click="$emit('update:modelValue', item.key)"
    >
      {{ item.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
interface TabItem {
  key: string
  label: string
}

defineProps<{
  items: TabItem[]
  modelValue: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
