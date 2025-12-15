<template>
  <ParentLayout>
    <template #page>
      <CategoryWrapper style="max-width: 900px;">

        <!-- 分类标签 -->
        <div class="category-filter" ref="categoryFilterRef">
          <!-- 激活状态层（蒙版） -->
          <div class="active-layer" :style="activeLayerStyle">
            <div class="category-item active-state">
              全部
              <span class="count">{{ articles.items.length }}</span>
            </div>
            <div v-for="(count, category) in categories" :key="category" class="category-item active-state">
              {{ category }}
              <span class="count">{{ count }}</span>
            </div>
          </div>

          <!-- 默认状态层 -->
          <div class="category-item" ref="allRef" @click="currentCategory = ''">
            全部
            <span class="count">{{ articles.items.length }}</span>
          </div>
          <div v-for="(count, category) in categories" :key="category" class="category-item"
            :ref="(el) => categoryRefs[category] = el"
            @click="toggleCategory(category)">
            {{ category }}
            <span class="count">{{ count }}</span>
          </div>
        </div>

        <!-- 文章列表 -->
        <div class="content-area">
          <ArticleList :items="items" />
        </div>
      </CategoryWrapper>
    </template>
  </ParentLayout>
</template>

<script setup name="ArticleLayout">
import { useBlogType } from '@vuepress/plugin-blog/client'
import ArticleList from './ArticleList.vue'
import { computed, ref, nextTick, onMounted, watch } from 'vue'

const articles = useBlogType('article')

// 当前选中的分类
const currentCategory = ref('')

// 根据分类筛选文章
const items = computed(() => {
  if (!currentCategory.value) {
    return articles.value.items
  }
  return articles.value.items.filter(item =>
    item.info.category && item.info.category.includes(currentCategory.value)
  )
})

// 切换分类
const toggleCategory = (category) => {
  if (currentCategory.value === category) {
    currentCategory.value = ''
  } else {
    currentCategory.value = category
  }
  updateIndicator()
}

// 获取所有类别及其文章数量
const categories = computed(() => {
  const catMap = {}
  articles.value.items.forEach(item => {
    if (item.info.category && Array.isArray(item.info.category)) {
      item.info.category.forEach(cat => {
        if (!catMap[cat]) catMap[cat] = 0
        catMap[cat]++
      })
    }
  })
  return catMap
})

// Refs for positioning
const categoryFilterRef = ref(null)
const allRef = ref(null)
const categoryRefs = ref({})
const activeLayerStyle = ref({ opacity: 0 })

// Update floating indicator position
const updateIndicator = () => {
  nextTick(() => {
    let targetEl = null
    if (currentCategory.value === '') {
      targetEl = allRef.value
    } else {
      targetEl = categoryRefs.value[currentCategory.value]
    }
    if (targetEl && categoryFilterRef.value) {
      const rect = targetEl.getBoundingClientRect()
      const parentRect = categoryFilterRef.value.getBoundingClientRect()
      
      const top = rect.top - parentRect.top
      const left = rect.left - parentRect.left
      const right = parentRect.width - left - rect.width
      const bottom = parentRect.height - top - rect.height
      
      activeLayerStyle.value = {
        clipPath: `inset(${top}px ${right}px ${bottom}px ${left}px round 1rem)`,
        opacity: 1
      }
    }
  })
}

// Watch for category changes and initial mount
onMounted(() => {
  updateIndicator()
})
watch(currentCategory, updateIndicator)
</script>

<style lang="scss">
.category-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.4rem;
  justify-content: center;
  position: relative;
}

.active-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--c-brand);
  z-index: 1;
  pointer-events: none;
  transition: clip-path 0.3s ease, opacity 0.3s ease;
  
  /* Layout matching parent */
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.category-item {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 1rem;
  border-radius: 1rem;
  background-color: var(--c-bg-light);
  color: var(--c-text);
  font-size: 0.9rem;
  cursor: pointer;
  border: 1px solid var(--c-border);
  transition: all 0.3s;

  &:hover {
    background-color: var(--c-bg-lighter);
  }

  &.active-state {
    background-color: transparent;
    border-color: transparent;
    color: #fff;
  }

  .count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-left: 0.5rem;
    padding: 0 0.4rem;
    height: 1rem;
    border-radius: 0.5rem;
    background-color: var(--c-bg);
    color: var(--c-text-light);
    font-size: 0.75rem;
  }

  &.active-state .count {
    background-color: rgba(255, 255, 255, 0.2);
    color: #fff;
  }
}

.content-area {
  width: 100%;
}
</style>
