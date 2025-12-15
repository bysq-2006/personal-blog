<template>
  <svg class="icon" aria-hidden="true">
    <use :xlink:href="iconHref" />
  </svg>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  name: { type: String, required: true }
})
const iconHref = computed(() => `/icons/icons.svg#${props.name}`)
</script>

<style scoped>
.icon {
  width: 22px;
  vertical-align: middle;
  fill: currentColor;
}
</style>
