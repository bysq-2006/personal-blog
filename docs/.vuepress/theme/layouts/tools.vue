<template>
  <ParentLayout>
    <template #page>
      <div class="tools-layout">
        <h1>工具列表</h1>
        <div v-if="tools && tools.items && tools.items.length > 0">
          <ul>
            <li v-for="tool in tools.items" :key="tool.path">
              <router-link :to="tool.path">{{ tool.info?.title || tool.title }}</router-link>
            </li>
          </ul>
        </div>
        <div v-else class="no-tools">
          <p>暂无工具</p>
        </div>
        <div class="tool-content">
          <Content />
        </div>
      </div>
    </template>
  </ParentLayout>
</template>

<script setup name="ToolsLayout">
import { useBlogType } from '@vuepress/plugin-blog/client'
import ParentLayout from './Layout.vue'

const tools = useBlogType('tools')
</script>

<style scoped>
.tools-layout {
  padding: 2rem;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin: 0.5rem 0;
}

.no-tools {
  color: #999;
  text-align: center;
  padding: 2rem;
}

.tool-content {
  margin-top: 2rem;
}
</style>