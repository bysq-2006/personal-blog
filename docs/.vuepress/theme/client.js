import { defineClientConfig } from 'vuepress/client'
import Layout from './layouts/Layout.vue'
import Home from './layouts/Home.vue'
import NotFound from './layouts/NotFound.vue'
import tools from './layouts/tools.vue'

export default defineClientConfig({
  layouts: {
    Layout,
    Home,
    NotFound,
    tools
  },
})