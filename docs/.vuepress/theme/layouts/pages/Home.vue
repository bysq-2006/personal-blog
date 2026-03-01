<template>
  <ParentLayout>
    <template #page>
      <div class="home-container">
        <div class="background-layer">
          <div class="sun-container">
            <img src="/home-assets/太阳.png" alt="太阳" class="sun" draggable="false" />
          </div>
          <div
            v-for="cloud in clouds"
            :key="cloud.id"
            class="cloud"
            :style="{ top: cloud.top + '%', left: cloud.left + '%', width: cloud.size + 'px', opacity: cloud.opacity, transform: 'scale(' + cloud.scale + ')', zIndex: cloud.zIndex }"
          >
            <img src="/home-assets/云.png" alt="云" draggable="false" />
          </div>
          <div class="plant">
            <img src="/home-assets/盆栽.png" alt="盆栽" draggable="false" />
          </div>
        </div>
        <div class="main-content">
          <div class="bookshelf-wrapper">
            <img src="/home-assets/书柜.png" alt="书柜" class="bookshelf" draggable="false" />
          </div>
          <div class="welcome-text">
            <h1 class="blog-title">MY BLOG</h1>
            <p class="blog-subtitle">Welcome to my little space ✨</p>
          </div>
        </div>
      </div>
    </template>
  </ParentLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import ParentLayout from '../Layout/Layout.vue'

const clouds = ref([])
const cloudIdCounter = ref(0)
let cloudAnimationId = null
let spawnTimeoutId = null
let cloudLayerIndex = 0
const MAX_CLOUDS = 5

const createCloud = (startLeft = null, forcedLayer = null) => {
  const id = cloudIdCounter.value++
  const size = 60 + Math.random() * 120
  const speed = 0.015
  const layers = [8, 14, 20, 26]
  const layer = forcedLayer !== null ? forcedLayer : cloudLayerIndex % 4
  const top = layers[layer] + (Math.random() * 2 - 1)
  cloudLayerIndex++
  const left = startLeft !== null ? startLeft : 110
  const opacity = 0.5 + Math.random() * 0.4
  const scale = 0.8 + Math.random() * 0.4
  const zIndex = Math.floor(Math.random() * 3) + 1
  return { id, size, speed, top, left, opacity, scale, zIndex }
}

const initClouds = () => {
  const layers = [0, 1, 2, 3]
  const spacing = 130 / 4
  layers.forEach((layer, i) => {
    clouds.value.push(createCloud(110 - (i * spacing), layer))
  })
}

const spawnCloud = () => {
  if (clouds.value.length < MAX_CLOUDS) clouds.value.push(createCloud())
}

const scheduleNextCloud = () => {
  spawnTimeoutId = setTimeout(() => {
    spawnCloud()
    scheduleNextCloud()
  }, 4000 + Math.random() * 2000)
}

const animateClouds = () => {
  clouds.value.forEach(cloud => cloud.left -= cloud.speed)
  clouds.value = clouds.value.filter(cloud => cloud.left > -30)
  cloudAnimationId = requestAnimationFrame(animateClouds)
}

onMounted(() => {
  if (cloudAnimationId) cancelAnimationFrame(cloudAnimationId)
  if (spawnTimeoutId) clearTimeout(spawnTimeoutId)
  clouds.value = []
  cloudLayerIndex = 0
  cloudIdCounter.value = 0
  initClouds()
  animateClouds()
  scheduleNextCloud()
})

onUnmounted(() => {
  if (cloudAnimationId) cancelAnimationFrame(cloudAnimationId)
  if (spawnTimeoutId) clearTimeout(spawnTimeoutId)
})
</script>

<style lang="scss" scoped>
.home-container {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #d4f1d4 0%, #e8f5e9 50%, #f1f8e9 100%);
  padding-top: 3.6rem;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}
img {
  -webkit-user-drag: none;
  -khtml-user-drag: none;
  -moz-user-drag: none;
  -o-user-drag: none;
  user-drag: none;
}
.background-layer {
  position: fixed;
  top: 2rem;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
}
.sun-container {
  position: absolute;
  top: 8%;
  left: 8%;
  width: 100px;
  animation: sun-sway 4s ease-in-out infinite;
  .sun {
    width: 100%;
    filter: drop-shadow(0 4px 8px rgba(255, 193, 7, 0.3));
  }
}
@keyframes sun-sway {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}
.cloud {
  position: absolute;
  pointer-events: none;
  img {
    width: 100%;
    filter: drop-shadow(0 2px 8px rgba(255, 255, 255, 0.3));
  }
}
.plant {
  position: absolute;
  bottom: 8%;
  right: 8%;
  width: 80px;
  img {
    width: 100%;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
  }
}
.main-content {
  position: relative;
  transform: translateX(-100px);
  z-index: 2;
  min-height: calc(100vh - 3.6rem);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8%;
}
.bookshelf-wrapper {
  flex: 0 0 auto;
  width: 800px;
  .bookshelf {
    width: 100%;
    filter: drop-shadow(0 15px 40px rgba(0, 0, 0, 0.15));
  }
}
.welcome-text {
  flex: 0 0 auto;
  .blog-title {
    font-size: 4rem;
    font-weight: 700;
    color: #2c3e50;
    margin: 0 0 1rem;
    letter-spacing: 2px;
  }
  .blog-subtitle {
    font-size: 1.4rem;
    color: #5a6c7d;
    margin: 0;
  }
}
html.dark .home-container {
  background: linear-gradient(135deg, #1a3a1a 0%, #0d2818 50%, #1a2f1a 100%);
}
html.dark .welcome-text .blog-title { color: #e8f5e9; }
html.dark .welcome-text .blog-subtitle { color: #a5d6a7; }
@media (max-width: 900px) {
  .main-content {
    flex-direction: column;
    gap: 3rem;
    padding: 3rem 5%;
  }
  .bookshelf-wrapper { width: 380px; }
  .welcome-text {
    text-align: center;
    .blog-title { font-size: 3rem; }
    .blog-subtitle { font-size: 1.2rem; }
  }
  .sun-container { width: 70px; }
  .plant { width: 60px; }
}
</style>