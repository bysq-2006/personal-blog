import { defineClientConfig } from 'vuepress/client'
import Article from './layouts/Article.vue'

export default defineClientConfig({
  // we provide some blog layouts
  layouts: {
    Article,
  },
})
