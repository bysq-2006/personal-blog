import { defineClientConfig } from 'vuepress/client'
import Layout from './layouts/Layout.vue'
import NotFound from './layouts/NotFound.vue'
import Home from './layouts/pages/Home.vue'
import tools from './layouts/pages/tools.vue'
import Article from './layouts/pages/Article.vue'
import project from './layouts/pages/project.vue'
import CategoryWrapper from './components/CategoryWrapper.vue'

export default defineClientConfig({
  layouts: {
    Layout,
    NotFound,
    Home,
    tools,
    Article,
    project
  },
  enhance: ({ app }) => {
    app.component('ParentLayout', Layout)
    app.component('CategoryWrapper', CategoryWrapper)
  },
})