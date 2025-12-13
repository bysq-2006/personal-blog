<template>
  <ParentLayout>
    <template #page>
      <CategoryWrapper>

        <!-- 分类标签 -->
        <div class="category-filter">
          <div class="category-item" :class="{ active: !currentCategory }" @click="currentCategory = ''">
            全部
            <span class="count">{{ articles.items.length }}</span>
          </div>
          <div v-for="(count, category) in categories" :key="category" class="category-item"
            :class="{ active: currentCategory === category }" @click="toggleCategory(category)">
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
import ArticleList from '@mytheme/components/ArticleList.vue'
import { computed, ref } from 'vue'

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
</script>

<style lang="scss">
.category-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.4rem;
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

  &.active {
    background-color: var(--c-brand);
    color: #fff;
    border-color: var(--c-brand);
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

  &.active .count {
    background-color: rgba(255, 255, 255, 0.2);
    color: #fff;
  }
}

.content-area {
  width: 100%;
}
</style>
