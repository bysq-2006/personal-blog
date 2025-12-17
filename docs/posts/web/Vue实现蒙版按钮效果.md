---
title: Vue 实现高性能的“蒙版”反色按钮切换效果
date: 2025-12-15
category:
  - web
tag:
  - Vue
  - CSS
  - 前端特效
---

在开发个人博客的分类切换功能时，我想要实现一个比较炫酷的交互效果：
有一个浮动的“滑块”指示当前选中的分类，当滑块移动时，不仅背景色平滑过渡，滑块覆盖的文字颜色也会随之变化（例如从深色变为白色），形成一种“反色”或“蒙版”的视觉体验。

本文记录了从构思到最终使用 `clip-path` 实现该效果的过程。

## 需求分析

我们需要实现的效果如下：
1.  **平滑移动**：切换分类时，高亮背景块从当前位置平滑移动到新位置。
2.  **文字反色**：背景块覆盖区域的文字显示为白色，未覆盖区域显示为深色。
3.  **自适应**：按钮宽度不固定，需根据内容自适应。

## 效果展示
特意调慢了速度，方便观察效果。
<div class="app">
  <h1>个人博客分类切换示范</h1>
  <div class="category-filter" ref="categoryFilterRef">
    <!-- 1. 激活状态层（顶层，作为蒙版） -->
    <div class="active-layer" :style="activeLayerStyle">
      <div class="category-item active-state">
        全部 <span class="count">10</span>
      </div>
      <div v-for="cat in categories" :key="cat" class="category-item active-state">
        {{ cat }} <span class="count">{{ 1 }}</span>
      </div>
    </div>
    <!-- 2. 默认状态层（底层，响应点击） -->
    <div class="category-item" ref="allRef" @click="currentCategory = ''">
      全部 <span class="count">10</span>
    </div>
    <div v-for="cat in categories" :key="cat"
          class="category-item"
          :ref="(el) => categoryRefs[cat] = el as HTMLElement"
          @click="currentCategory = cat">
      {{ cat }} <span class="count">{{ 1 }}</span>
    </div>
  </div>
</div>

<script setup lang="ts">
import { ref, nextTick, watch, onMounted } from 'vue'

const categories = ref(['技术', '生活', '随笔', '其他'])
const currentCategory = ref('')
const categoryFilterRef = ref<HTMLElement>()
const allRef = ref<HTMLElement>()
const categoryRefs = ref<Record<string, HTMLElement>>({})

const activeLayerStyle = ref({ opacity: 0 })

const updateIndicator = () => {
  nextTick(() => {
    // 1. 找到当前选中的目标元素
    let targetEl = currentCategory.value === '' ? allRef.value : categoryRefs.value[currentCategory.value]
    
    if (targetEl && categoryFilterRef.value) {
      const rect = targetEl.getBoundingClientRect()
      const parentRect = categoryFilterRef.value.getBoundingClientRect()
      
      // 2. 计算 inset 的四个值 (上 右 下 左)
      const top = rect.top - parentRect.top
      const left = rect.left - parentRect.left
      const right = parentRect.width - left - rect.width
      const bottom = parentRect.height - top - rect.height
      
      // 3. 设置样式
      activeLayerStyle.value = {
        // 使用 inset 进行矩形裁剪，round 1rem 设置圆角
        clipPath: `inset(${top}px ${right}px ${bottom}px ${left}px round 1rem)`,
        opacity: 1
      }
    }
  })
}

// 监听变化
watch(currentCategory, updateIndicator)
onMounted(updateIndicator)
</script>

<style scoped>
.app {
  padding: 2rem;
  font-family: Arial, sans-serif;
}

.category-filter {
  position: relative; /* 定位基准 */
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

/* 激活层：覆盖在上面 */
.active-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #007bff; /* 品牌色背景 */
  z-index: 1;
  pointer-events: none; /* 关键：让点击事件穿透到底层 */
  transition: clip-path 2s ease; /* 平滑过渡 */
  
  /* 布局必须与底层完全一致 */
  display: flex;
  gap: 0.5rem;
}

/* 按钮基础样式 */
.category-item {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 1rem;
  background-color: #f8f9fa;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.category-item:hover {
  background-color: #e9ecef;
}

.category-item .count {
  font-size: 0.8rem;
  opacity: 0.7;
}

/* 激活层里的按钮样式 */
.category-item.active-state {
  background-color: transparent;
  color: #fff; /* 白色文字 */
  border-color: transparent;
}

.category-item.active-state .count {
  color: rgba(255, 255, 255, 0.8);
}
</style>

## 方案演进

### 方案一：简单的 active 类切换
最普通的做法是给选中的按钮添加 `.active` 类。
优点：简单。
缺点：没有滑块移动的动画，生硬。

### 方案二：绝对定位的背景块
添加一个绝对定位的 `div` 作为背景块，通过计算位置移动它。
优点：有背景移动动画。
缺点：文字颜色变化是突变的。当背景块滑过中间的按钮时，中间按钮的文字颜色无法“一半黑一半白”，只能整体变色，视觉效果不够细腻。

### 方案三：双层结构 + clip-path 裁剪（最终方案）
为了实现极致的“蒙版”效果，即文字颜色也能随着滑块移动而平滑过渡（甚至一个字被切成两半颜色），我们需要用到“双层叠加”的思路。

#### 核心原理
1.  **底层（默认层）**：放置原本的按钮列表，设置默认样式（灰色背景，深色文字）。
2.  **顶层（激活层）**：在完全相同的位置，覆盖一层**一模一样**的按钮列表，但设置激活样式（品牌色背景，白色文字）。
3.  **裁剪**：使用 CSS 的 `clip-path: inset(...)` 属性，只显示顶层中“当前选中按钮”的那一部分区域，其余部分裁剪隐藏。
4.  **动画**：通过过渡 `clip-path` 的值，实现滑块的移动和形变效果。

## 代码实现

### 1. HTML 结构
我们需要两层结构，`category-filter` 是父容器。

```html
<template>
  <div class="app">
    <h1>个人博客分类切换示范</h1>
    <div class="category-filter" ref="categoryFilterRef">
      <!-- 1. 激活状态层（顶层，作为蒙版） -->
      <div class="active-layer" :style="activeLayerStyle">
        <div class="category-item active-state">
          全部 <span class="count">10</span>
        </div>
        <div v-for="cat in categories" :key="cat" class="category-item active-state">
          {{ cat }} <span class="count">{{ Math.floor(Math.random() * 20) + 1 }}</span>
        </div>
      </div>

      <!-- 2. 默认状态层（底层，响应点击） -->
      <div class="category-item" ref="allRef" @click="currentCategory = ''">
        全部 <span class="count">10</span>
      </div>
      <div v-for="cat in categories" :key="cat"
           class="category-item"
           :ref="(el) => categoryRefs[cat] = el as HTMLElement"
           @click="currentCategory = cat">
        {{ cat }} <span class="count">{{ Math.floor(Math.random() * 20) + 1 }}</span>
      </div>
    </div>
  </div>
</template>
```

### 2. CSS 样式
关键在于 `active-layer` 的定位和 `pointer-events`。

```scss
<style scoped>
.app {
  padding: 2rem;
  font-family: Arial, sans-serif;
}

.category-filter {
  position: relative; /* 定位基准 */
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

/* 激活层：覆盖在上面 */
.active-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #007bff; /* 品牌色背景 */
  z-index: 1;
  pointer-events: none; /* 关键：让点击事件穿透到底层 */
  transition: clip-path 0.3s ease; /* 平滑过渡 */
  
  /* 布局必须与底层完全一致 */
  display: flex;
  gap: 0.5rem;
}

/* 按钮基础样式 */
.category-item {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 1rem;
  background-color: #f8f9fa;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.category-item:hover {
  background-color: #e9ecef;
}

.category-item .count {
  font-size: 0.8rem;
  opacity: 0.7;
}

/* 激活层里的按钮样式 */
.category-item.active-state {
  background-color: transparent;
  color: #fff; /* 白色文字 */
  border-color: transparent;
}

.category-item.active-state .count {
  color: rgba(255, 255, 255, 0.8);
}
</style>
```

### 3. JS 逻辑 (Vue 3)
计算选中元素相对于父容器的位置，动态设置 `clip-path`。

```javascript
import { ref, nextTick, watch, onMounted } from 'vue'

const categories = ref(['技术', '生活', '随笔', '其他'])
const currentCategory = ref('')
const categoryFilterRef = ref<HTMLElement>()
const allRef = ref<HTMLElement>()
const categoryRefs = ref<Record<string, HTMLElement>>({})

const activeLayerStyle = ref({ opacity: 0 })

const updateIndicator = () => {
  nextTick(() => {
    // 1. 找到当前选中的目标元素
    let targetEl = currentCategory.value === '' ? allRef.value : categoryRefs.value[currentCategory.value]
    
    if (targetEl && categoryFilterRef.value) {
      const rect = targetEl.getBoundingClientRect()
      const parentRect = categoryFilterRef.value.getBoundingClientRect()
      
      // 2. 计算 inset 的四个值 (上 右 下 左)
      const top = rect.top - parentRect.top
      const left = rect.left - parentRect.left
      const right = parentRect.width - left - rect.width
      const bottom = parentRect.height - top - rect.height
      
      // 3. 设置样式
      activeLayerStyle.value = {
        // 使用 inset 进行矩形裁剪，round 1rem 设置圆角
        clipPath: `inset(${top}px ${right}px ${bottom}px ${left}px round 1rem)`,
        opacity: 1
      }
    }
  })
}

// 监听变化
watch(currentCategory, updateIndicator)
onMounted(updateIndicator)
```


## 总结

通过 `clip-path` 配合双层结构，我们巧妙地实现了复杂的 UI 交互：
1.  **视觉上**：看起来像是一个滑块在移动，且滑块内的文字自动反色。
2.  **逻辑上**：其实是改变了顶层的“可视窗口”范围。
3.  **交互上**：利用 `pointer-events: none` 保证了底层按钮的点击功能不受影响。

这种方案比计算 `transform` 反向位移更直观，且性能表现优异。
