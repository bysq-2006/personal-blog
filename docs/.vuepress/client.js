import { defineClientConfig } from 'vuepress/client'
import Article from './layouts/Article.vue'
import Category from './layouts/Category.vue'

export default defineClientConfig({
  // we provide some blog layouts
  layouts: {
    Article,
    Category,
  },
})
