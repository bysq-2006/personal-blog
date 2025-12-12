import { defineClientConfig } from 'vuepress/client'
import Layout from './layouts/Layout.vue'
import NotFound from './layouts/NotFound.vue'

export default defineClientConfig({
  layouts: {
    Layout,
    NotFound,
    // 确保 blog 插件请求的布局也使用我们的 Layout
    Article: Layout,
    Category: Layout,
  },
})