<template>
  <ParentLayout>
    <template #page>
      <CategoryWrapper>
        <div v-if="tools && tools.items && tools.items.length > 0">
          <ul>
            <li v-for="tool in tools.items" :key="tool.path">
              <router-link :to="tool.path">{{ tool.info?.title || tool.title }}</router-link>
            </li>
          </ul>
        </div>
        <div v-else class="no-content">
          <p>暂无工具</p>
        </div>
        <div class="content-area">
          <Content />
        </div>
      </CategoryWrapper>
    </template>
  </ParentLayout>
</template>

<script setup name="ToolsLayout">
import { useBlogType } from '@vuepress/plugin-blog/client'

const tools = useBlogType('tools')
</script>

<style scoped></style>