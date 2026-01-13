---
date: 2026-1-13
category:
  - 硬件相关
title: PID控制原理及应用
---

## 为了解决什么问题
在自动控制系统中，如何使被控对象（如温度、速度、位置等）达到并维持在设定值是一个关键问题。PID控制器通过调节控制变量来实现这一目标，确保系统响应迅速且稳定，减少超调和振荡现象。

更具体的说，对于单一的一个可以量化的物理量，我们只能控制一个间接影响这个物理量的值，并希望它能达到一个目标值，并且在达到目标值后能够稳定下来，不会因为外界扰动或系统本身的变化而偏离目标值。PID控制器通过对误差进行计算和调整，帮助实现这一目标。

## 从第一步开始
假如现在存在一个无人机，我们需要它停在空中30m处，而我们唯一可以做的是控制它的推进器推力大小。

很容易就能想到，如果我们检测到当前无人机的高度小于30m，那么我们就增加推力，反之则减少推力。
但是这样做会有什么问题呢？假设无人机当前高度为20m，我们增加推力让它上升，当它达到30m时，我们又减少推力让它下降。由于惯性的作用，无人机会继续上升到超过30m的高度，然后我们又增加推力让它下降。这样一来，无人机就会在30m上下振荡，无法稳定在目标高度。

做一个小优化，我们让推力的增加和减少与当前高度和目标高度的差值成正比。这样一来，当无人机接近30m时，推力的调整会变得更小，从而减少振荡的幅度。

那么，当前推力**F = Kp * (目标高度 - 当前高度)**

我们看看这个示例：

<!-- 场景 1: P 控制器 -->
<div class="scenario-section">
  <div class="scenario-header">
    <h3>{{ drones[0].label }}</h3>
    <p class="desc">{{ drones[0].description }}</p>
    <div class="local-controls">
        <button class="primary small" v-if="!drones[0].isRunning" @click="toggleDrone(drones[0])">▶ 开始</button>
        <button class="warning small" v-else @click="toggleDrone(drones[0])">⏸ 暂停</button>
        <button class="danger small" @click="resetDrone(drones[0])">↺ 重置</button>
    </div>
  </div>
  <div class="scenario-body">
    <div class="params-editor">
      <div class="param-row">
        <span class="label">Kp</span>
        <input type="range" min="0" max="20" step="0.1" v-model.number="drones[0].kp">
        <span class="val">{{ drones[0].kp.toFixed(1) }}</span>
      </div>
    </div>
    <div class="dashboard-row">
      <div class="world-view">
        <div class="target-line" :style="{ bottom: (TARGET_HEIGHT * 4) + 'px' }">30m</div>
        <div class="drone-sprite" :style="{ bottom: (drones[0].height * 4) + 'px' }">
          🚁
          <div class="flame" :style="{ opacity: Math.min(Math.abs(drones[0].lastOutput) / 50, 1) }">🔥</div>
        </div>
        <div class="height-text">{{ drones[0].height.toFixed(1) }}m</div>
      </div>
      <div class="chart-view">
        <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="none">
          <rect width="400" height="200" fill="#fcfcfc" />
          <line x1="0" :y1="targetLineY" x2="400" :y2="targetLineY" stroke="#4CAF50" stroke-dasharray="4" />
          <polyline :points="getPoints(drones[0].history)" fill="none" stroke="#2196F3" stroke-width="2" />
        </svg>
      </div>
    </div>
  </div>
  <div class="info-footer">
    <span>推力: {{ drones[0].lastOutput.toFixed(1) }} N</span>
    <span>速度: {{ drones[0].velocity.toFixed(1) }} m/s</span>
  </div>
</div>

可以很明显的发现，要么kp太小，无法克服重力导致无人机无法升到30m；要么kp太大，导致无人机在30m上下振荡。
那么，有没有什么办法可以让无人机稳定在30m处呢？

## 引入积分项 (I)
我们先处理kp太小的情况。假设无人机达到了一个稳定高度25m，虽然没有达到30m，但是我们可以发现无人机在25m处是静止的，说明此时推力和重力
达到了平衡。那么，我们可以通过引入一个积分项来解决这个问题。

积分项的作用是累积过去的误差，当无人机无法达到目标高度时，积分项会不断增加，从而增加推力，直到无人机达到目标高度为止。

具体来说，我们可以定义当前推力为：<br>
**F = Kp * (目标高度 - 当前高度) + Ki * ∫(目标高度 - 当前高度) dt**

<!-- 场景 2: PI 控制器 -->
<div class="scenario-section">
  <div class="scenario-header">
    <h3>{{ drones[1].label }}</h3>
    <p class="desc">{{ drones[1].description }}</p>
    <div class="local-controls">
        <button class="primary small" v-if="!drones[1].isRunning" @click="toggleDrone(drones[1])">▶ 开始</button>
        <button class="warning small" v-else @click="toggleDrone(drones[1])">⏸ 暂停</button>
        <button class="danger small" @click="resetDrone(drones[1])">↺ 重置</button>
    </div>
  </div>
  <div class="scenario-body">
    <div class="params-editor">
      <div class="param-row">
        <span class="label">Kp</span>
        <input type="range" min="0" max="20" step="0.1" v-model.number="drones[1].kp">
        <span class="val">{{ drones[1].kp.toFixed(1) }}</span>
      </div>
      <div class="param-row">
        <span class="label">Ki</span>
        <input type="range" min="0" max="10" step="0.01" v-model.number="drones[1].ki">
        <span class="val">{{ drones[1].ki.toFixed(2) }}</span>
      </div>
    </div>
    <div class="dashboard-row">
      <div class="world-view">
        <div class="target-line" :style="{ bottom: (TARGET_HEIGHT * 4) + 'px' }">30m</div>
        <div class="drone-sprite" :style="{ bottom: (drones[1].height * 4) + 'px' }">
          🚁
          <div class="flame" :style="{ opacity: Math.min(Math.abs(drones[1].lastOutput) / 50, 1) }">🔥</div>
        </div>
        <div class="height-text">{{ drones[1].height.toFixed(1) }}m</div>
      </div>
      <div class="chart-view">
        <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="none">
          <rect width="400" height="200" fill="#fcfcfc" />
          <line x1="0" :y1="targetLineY" x2="400" :y2="targetLineY" stroke="#4CAF50" stroke-dasharray="4" />
          <polyline :points="getPoints(drones[1].history)" fill="none" stroke="#2196F3" stroke-width="2" />
        </svg>
      </div>
    </div>
  </div>
  <div class="info-footer">
    <span>推力: {{ drones[1].lastOutput.toFixed(1) }} N</span>
    <span>速度: {{ drones[1].velocity.toFixed(1) }} m/s</span>
  </div>
</div>

很明显，稳态误差被消除了，无人机能够稳定在30m处。但是，我们也可以看到，无人机的震荡变得更加严重了。这是因为i会存储状态，导致系统惯性变大。

## 引入微分项 (D)
为了减少振荡，我们可以引入微分项。微分项的作用是预测未来的误差变化趋势，从而提前调整推力，减少振荡。

说人话，它是一个阻尼，会向着速度的反方向施加力，从而减缓无人机的运动。而力的大小与速度成正比。

不过，我们现在先不引入i，先看看pd控制器的缺陷。

公式：<br>
**F = Kp * (目标高度 - 当前高度) + Kd * d(目标高度 - 当前高度)/dt**

<!-- 场景 3: PD 控制器 -->
<div class="scenario-section">
  <div class="scenario-header">
    <h3>{{ drones[2].label }}</h3>
    <p class="desc">{{ drones[2].description }}</p>
    <div class="local-controls">
        <button class="primary small" v-if="!drones[2].isRunning" @click="toggleDrone(drones[2])">▶ 开始</button>
        <button class="warning small" v-else @click="toggleDrone(drones[2])">⏸ 暂停</button>
        <button class="danger small" @click="resetDrone(drones[2])">↺ 重置</button>
    </div>
  </div>
  <div class="scenario-body">
    <div class="params-editor">
      <div class="param-row">
        <span class="label">Kp</span>
        <input type="range" min="0" max="20" step="0.1" v-model.number="drones[2].kp">
        <span class="val">{{ drones[2].kp.toFixed(1) }}</span>
      </div>
      <div class="param-row">
        <span class="label">Kd</span>
        <input type="range" min="0" max="50" step="0.5" v-model.number="drones[2].kd">
        <span class="val">{{ drones[2].kd.toFixed(1) }}</span>
      </div>
    </div>
    <div class="dashboard-row">
      <div class="world-view">
        <div class="target-line" :style="{ bottom: (TARGET_HEIGHT * 4) + 'px' }">30m</div>
        <div class="drone-sprite" :style="{ bottom: (drones[2].height * 4) + 'px' }">
          🚁
          <div class="flame" :style="{ opacity: Math.min(Math.abs(drones[2].lastOutput) / 50, 1) }">🔥</div>
        </div>
        <div class="height-text">{{ drones[2].height.toFixed(1) }}m</div>
      </div>
      <div class="chart-view">
        <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="none">
          <rect width="400" height="200" fill="#fcfcfc" />
          <line x1="0" :y1="targetLineY" x2="400" :y2="targetLineY" stroke="#4CAF50" stroke-dasharray="4" />
          <polyline :points="getPoints(drones[2].history)" fill="none" stroke="#2196F3" stroke-width="2" />
        </svg>
      </div>
    </div>
  </div>
  <div class="info-footer">
    <span>推力: {{ drones[2].lastOutput.toFixed(1) }} N</span>
    <span>速度: {{ drones[2].velocity.toFixed(1) }} m/s</span>
  </div>
</div>

可以看到，振荡得到了明显的改善，无人机能够更快地稳定在30m处。但是，我们也可以看到，无人机无法完全达到30m，存在一个小的稳态误差。

## 结合三者：PID 控制器
最后，我们将三者结合起来，形成PID控制器。这样一来，我们既能消除稳态误差，又能减少振荡。
公式：<br>
**F = Kp * (目标高度 - 当前高度) + Ki * ∫(目标高度 - 当前高度) dt + Kd * d(目标高度 - 当前高度)/dt**

<!-- 场景 4: PID 控制器 -->
<div class="scenario-section">
  <div class="scenario-header">
    <h3>{{ drones[3].label }}</h3>
    <p class="desc">{{ drones[3].description }}</p>
    <div class="local-controls">
        <button class="primary small" v-if="!drones[3].isRunning" @click="toggleDrone(drones[3])">▶ 开始</button>
        <button class="warning small" v-else @click="toggleDrone(drones[3])">⏸ 暂停</button>
        <button class="danger small" @click="resetDrone(drones[3])">↺ 重置</button>
    </div>
  </div>
  <div class="scenario-body">
    <div class="params-editor">
      <div class="param-row">
        <span class="label">Kp</span>
        <input type="range" min="0" max="20" step="0.1" v-model.number="drones[3].kp">
        <span class="val">{{ drones[3].kp.toFixed(1) }}</span>
      </div>
      <div class="param-row">
        <span class="label">Ki</span>
        <input type="range" min="0" max="10" step="0.01" v-model.number="drones[3].ki">
        <span class="val">{{ drones[3].ki.toFixed(2) }}</span>
      </div>
      <div class="param-row">
        <span class="label">Kd</span>
        <input type="range" min="0" max="50" step="0.5" v-model.number="drones[3].kd">
        <span class="val">{{ drones[3].kd.toFixed(1) }}</span>
      </div>
    </div>
    <div class="dashboard-row">
      <div class="world-view">
        <div class="target-line" :style="{ bottom: (TARGET_HEIGHT * 4) + 'px' }">30m</div>
        <div class="drone-sprite" :style="{ bottom: (drones[3].height * 4) + 'px' }">
          🚁
          <div class="flame" :style="{ opacity: Math.min(Math.abs(drones[3].lastOutput) / 50, 1) }">🔥</div>
        </div>
        <div class="height-text">{{ drones[3].height.toFixed(1) }}m</div>
      </div>
      <div class="chart-view">
        <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="none">
          <rect width="400" height="200" fill="#fcfcfc" />
          <line x1="0" :y1="targetLineY" x2="400" :y2="targetLineY" stroke="#4CAF50" stroke-dasharray="4" />
          <polyline :points="getPoints(drones[3].history)" fill="none" stroke="#2196F3" stroke-width="2" />
        </svg>
      </div>
    </div>
  </div>
  <div class="info-footer">
    <span>推力: {{ drones[3].lastOutput.toFixed(1) }} N</span>
    <span>速度: {{ drones[3].velocity.toFixed(1) }} m/s</span>
  </div>
</div>

效果非常明显，PID控制器能够让无人机快速且稳定地达到30m高度，并且几乎没有振荡。

## 一些想法
这个例子里面，是一个非常理想化的场景，实际应用中，PID控制器的调参是一个复杂的过程，需要根据具体系统的动态特性进行调整。

并且，pid只能在单变量控制中使用，对于多变量控制系统，需要使用更复杂的控制算法，如状态空间控制、模型预测控制等。

或者，如果两个变量之间耦合不强，也可以使用多个pid控制器分别控制不同的变量。

总之，碰到需要控制的场景时，可以先试试pid控制器，往往能带来不错的效果。如果不行，再考虑更复杂的控制方法。

bye

<script setup lang="ts">
import { ref, computed, reactive, onUnmounted } from 'vue'

// Constants
const TARGET_HEIGHT = 30
const GRAVITY = 9.8
const MASS = 1.0

type ControlType = 'P' | 'PI' | 'PD' | 'PID'

interface DroneState {
  id: string
  type: ControlType
  label: string
  description?: string
  isRunning: boolean
  // Tuning Params
  kp: number
  ki: number
  kd: number
  // Physics State
  height: number
  velocity: number
  // Controller State
  integralSum: number
  lastError: number
  // Visualization
  history: {t: number, h: number}[]
  lastOutput: number // To show thrust amount
}

const drones = reactive<DroneState[]>([
  { 
    id: 'p', type: 'P', label: '1. 纯比例控制 (P Controller)', 
    description: '只有 Kp。会产生稳态误差，无法完全消除重力影响。',
    isRunning: false,
    kp: 2.0, ki: 0, kd: 0,
    height: 0, velocity: 0, integralSum: 0, lastError: 0, history: [], lastOutput: 0 
  },
  { 
    id: 'pi', type: 'PI', label: '2. 比例+积分控制 (PI Controller)', 
    description: '增加 Ki。积分项消除稳态误差，但可能引入低频振荡。',
    isRunning: false,
    kp: 2.0, ki: 0.5, kd: 0,
    height: 0, velocity: 0, integralSum: 0, lastError: 0, history: [], lastOutput: 0
  },
  { 
    id: 'pd', type: 'PD', label: '3. 比例+微分控制 (PD Controller)', 
    description: '增加 Kd。微分项提供阻尼，减少振荡，响应更快，但无法消除稳态误差。',
    isRunning: false,
    kp: 2.0, ki: 0, kd: 5.0,
    height: 0, velocity: 0, integralSum: 0, lastError: 0, history: [], lastOutput: 0
  },
  { 
    id: 'pid', type: 'PID', label: '4. PID 控制 (PID Controller)', 
    description: '结合三者。P响应，I消误，D减振。',
    isRunning: false,
    kp: 5.0, ki: 0.5, kd: 10.0,
    height: 0, velocity: 0, integralSum: 0, lastError: 0, history: [], lastOutput: 0
  }
])

const isLoopRunning = ref(false)
let timer: number | null = null
let // simulationTime not used globally in new logic, but kept for compatibility if needed or removed
    simulationTime = 0
let lastTimestamp = 0

// Global Actions (Removed per request)
// Individual Actions
const toggleDrone = (d: DroneState) => {
  d.isRunning = !d.isRunning
  if (d.isRunning) {
    ensureLoopRunning()
  }
}

const resetDrone = (d: DroneState) => {
  d.isRunning = false
  resetThisDrone(d)
}

const resetThisDrone = (d: DroneState) => {
  d.height = 0
  d.velocity = 0
  d.integralSum = 0
  d.lastError = 0
  d.history = []
  d.lastOutput = 0
}

const ensureLoopRunning = () => {
  if (!isLoopRunning.value) {
    isLoopRunning.value = true
    lastTimestamp = performance.now()
    tick()
  }
}

const updateDrone = (drone: DroneState, dt: number) => {
  // Error calculation
  const error = TARGET_HEIGHT - drone.height
  
  // 1. Proportional Term
  const P = drone.kp * error
  
  // 2. Integral Term
  if (drone.type.includes('I')) {
    drone.integralSum += error * dt
  }
  const I = drone.ki * drone.integralSum
  
  // 3. Derivative Term
  let D = 0
  if (drone.type.includes('D')) {
    // Protect against dt=0 just in case, though tick handles it
    if (dt > 0.0001) {
       const derivative = (error - drone.lastError) / dt
       D = drone.kd * derivative
    }
  }
  drone.lastError = error
  
  // Total Thrust
  // User requested reverse thrust allowed (bidirectional thrusters)
  let thrust = P + I + D
  
  drone.lastOutput = thrust

  // Physics F = ma
  const weight = MASS * GRAVITY
  const netForce = thrust - weight
  const acceleration = netForce / MASS
  
  drone.velocity += acceleration * dt
  drone.height += drone.velocity * dt
  
  // Ground collision
  if (drone.height < 0) {
    drone.height = 0
    drone.velocity = -drone.velocity * 0.5 // Bounce
    if (Math.abs(drone.velocity) < 0.1) drone.velocity = 0
  }
  
  // History
  drone.history.push({ t: simulationTime, h: drone.height })
  if (drone.history.length > 500) drone.history.shift()
}

const tick = () => {
  if (!isLoopRunning.value) return

  const now = performance.now()
  const dt = Math.min((now - lastTimestamp) / 1000, 0.1)
  
  // Prevent division by zero or extremely small steps causing instability
  if (dt < 0.001) {
    timer = requestAnimationFrame(tick)
    return
  }
  
  lastTimestamp = now

  simulationTime += dt

  let anyRunning = false
  drones.forEach(d => {
    if (d.isRunning) {
      updateDrone(d, dt)
      anyRunning = true
    }
  })
  
  if (!anyRunning) {
      isLoopRunning.value = false
      timer = null
      return
  }
  
  timer = requestAnimationFrame(tick)
}

// Chart Helper
const getPoints = (history: {t: number, h: number}[]) => {
  if (history.length < 2) return ""
  const width = 400
  const heightPx = 200
  const scaleY = 4 // 50m = 200px -> 1m = 4px
  
  return history.map((pt, index) => {
    const x = (index / (history.length - 1 || 1)) * width
    const y = heightPx - (pt.h * scaleY) 
    return `${x},${y}`
  }).join(' ')
}

const targetLineY = 200 - (TARGET_HEIGHT * 4)

onUnmounted(() => {
  drones.forEach(d => d.isRunning = false)
})
</script>

<style scoped>
.scenario-section {
  background: white;
  border-left: 5px solid #2196F3;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  padding: 20px;
  margin-bottom: 20px;
}

.scenario-header h3 {
  margin: 0 0 5px 0;
  color: #333;
}
.scenario-header .desc {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 0.9em;
  font-style: italic;
}

.local-controls {
  margin-bottom: 10px;
}

.local-controls button.small {
  padding: 4px 10px;
  font-size: 12px;
  margin-right: 5px;
}

.scenario-body {
  display: flex;
  gap: 20px;
  flex-wrap: wrap; /* On small screens */
}

.params-editor {
  flex: 0 0 180px;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.param-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}
.param-row:last-child { margin-bottom: 0; }

.param-row .label { width: 30px; font-weight: bold; color: #555; }
.param-row input { flex: 1; min-width: 0; }
.param-row .val { width: 35px; text-align: right; font-family: monospace; font-size: 0.9em; }

.dashboard-row {
  flex: 1;
  display: flex;
  height: 200px;
  gap: 15px;
}

.world-view {
  width: 100px;
  background: linear-gradient(to bottom, #B3E5FC 0%, #E1F5FE 100%);
  position: relative;
  border: 1px solid #ddd;
  border-bottom: 4px solid #795548;
  overflow: hidden;
  border-radius: 4px;
}

.target-line {
  position: absolute;
  width: 100%;
  border-top: 1px dashed #2E7D32;
  color: #2E7D32;
  font-size: 10px;
  text-align: right;
  padding-right: 2px;
}

.drone-sprite {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 24px;
  transition: bottom 0.05s linear;
  width: 30px;
  text-align: center;
  line-height: 1;
}

.flame {
  font-size: 14px;
  margin-top: -4px;
  /* Flip if thrust is negative? Na, just scale opacity */
}

.height-text {
  position: absolute;
  top: 5px;
  left: 5px;
  font-size: 11px;
  color: #444;
  background: rgba(255,255,255,0.8);
  padding: 2px 4px;
  border-radius: 2px;
}

.chart-view {
  flex: 1;
  border: 1px solid #eee;
  background: #fcfcfc;
  border-radius: 4px;
}

.info-footer {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 20px;
  color: #666;
  font-size: 0.9em;
}
</style>
