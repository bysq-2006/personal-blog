<template>
  <div ref="host" class="paper-home" />
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import layout from '@paper-home/layout.json'
import buildingUrl from '@paper-home/assets/models/building/home.glb?url'
import houseplantUrl from '@paper-home/assets/models/plants/houseplant.glb?url'
import pottedPlantUrl from '@paper-home/assets/models/plants/potted-plant.glb?url'
import succulentUrl from '@paper-home/assets/models/plants/succulent.glb?url'
import laptopUrl from '@paper-home/assets/models/props/laptop.glb?url'
import coastUrl from '@paper-home/assets/sprites/coast.png?url'
import cloud1Url from '@paper-home/assets/sprites/cloud-1.png?url'
import cloud2Url from '@paper-home/assets/sprites/cloud-2.png?url'
import cloud3Url from '@paper-home/assets/sprites/cloud-3.png?url'

const VIEW_ORDER = ['home', 'floor_1', 'floor_2', 'floor_3', 'floor_4']

const host = ref(null)
let api = null

const onWheel = (e) => {
  if (!api) return
  const i = VIEW_ORDER.indexOf(api.getState())
  if (i < 0) return
  if (e.deltaY > 0 && i < VIEW_ORDER.length - 1) api.goto(VIEW_ORDER[i + 1])
  else if (e.deltaY < 0 && i > 0) api.goto(VIEW_ORDER[i - 1])
}

onMounted(async () => {
  const { createScene } = await import('./paper-home/createScene.js')
  api = await createScene(host.value, {
    layout,
    buildingUrl,
    catalogUrls: {
      houseplant: houseplantUrl,
      'potted-plant': pottedPlantUrl,
      succulent: succulentUrl,
      laptop: laptopUrl,
    },
    sprites: {
      coast: coastUrl,
      cloud1: cloud1Url,
      cloud2: cloud2Url,
      cloud3: cloud3Url,
    },
  })
  host.value.addEventListener('wheel', onWheel, { passive: true })
})

onUnmounted(() => {
  host.value?.removeEventListener('wheel', onWheel)
  api?.dispose()
  api = null
})
</script>

<style scoped>
.paper-home {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
  background: #efe6d6;
}

.paper-home :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
