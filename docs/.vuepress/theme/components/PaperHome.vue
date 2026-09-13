<template>
  <div ref="host" class="paper-home">
    <button v-if="atGithub" type="button" class="back" @click="leaveGithub">← 返回</button>
  </div>
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
const atGithub = ref(false)
let api = null
let lastView = 'home'
let pointer = null

const go = (name, dir = 0) => {
  api.goto(name, dir)
  api.setSway(VIEW_ORDER.includes(name))
  api.setScreenLive(name === 'github')
}

const leaveGithub = () => {
  if (!api) return
  atGithub.value = false
  go(lastView)
}

const onWheel = (e) => {
  if (!api) return
  if (api.getState() === 'github') {
    leaveGithub()
    return
  }
  const i = VIEW_ORDER.indexOf(api.getState())
  if (i < 0) return
  if (e.deltaY > 0 && i < VIEW_ORDER.length - 1) go(VIEW_ORDER[i + 1], 1)
  else if (e.deltaY < 0 && i > 0) go(VIEW_ORDER[i - 1], -1)
}

const onPointerDown = (e) => {
  if (e.button === 0) pointer = { x: e.clientX, y: e.clientY }
}

const onPointerUp = (e) => {
  if (!api || !pointer || atGithub.value) return
  const dx = e.clientX - pointer.x
  const dy = e.clientY - pointer.y
  pointer = null
  if (dx * dx + dy * dy > 25) return
  if (!api.hitLaptop(e)) return
  lastView = api.getState()
  atGithub.value = true
  go('github')
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
  const canvas = api.canvas
  host.value.addEventListener('wheel', onWheel, { passive: true })
  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointerup', onPointerUp)
})

onUnmounted(() => {
  host.value?.removeEventListener('wheel', onWheel)
  api?.canvas?.removeEventListener('pointerdown', onPointerDown)
  api?.canvas?.removeEventListener('pointerup', onPointerUp)
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

.back {
  position: absolute;
  top: calc(var(--navbar-height, 3.6rem) + 14px);
  left: 22px;
  z-index: 2;
  padding: 7px 16px 8px;
  font: 600 15px/1 Georgia, "Songti SC", "Noto Serif SC", serif;
  letter-spacing: 0.08em;
  color: #2a2622;
  background: #f3ece1;
  border: 2px solid #2a2622;
  border-radius: 255px 18px 225px 18px / 18px 225px 18px 255px;
  box-shadow: 2px 3px 0 #2a2622;
  transform: rotate(-2.2deg);
  cursor: pointer;
}

.back:hover {
  background: #efe6d6;
  transform: rotate(1.4deg) scale(1.04);
}
</style>
