<template>
  <ParentLayout>
    <template #page>
      <ClientOnly>
        <PaperHome />
      </ClientOnly>
    </template>
  </ParentLayout>
</template>

<script setup>
import ParentLayout from '../Layout/Layout.vue'
import PaperHome from '../../components/PaperHome.vue'
</script>
