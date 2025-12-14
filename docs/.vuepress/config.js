import { blogPlugin } from '@vuepress/plugin-blog'
import { searchPlugin } from '@vuepress/plugin-search'
import { defineUserConfig } from 'vuepress'
import { viteBundler } from '@vuepress/bundler-vite'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import customTheme from './theme/index.js'

export default defineUserConfig({
  lang: 'zh-CN',
  title: '白银三清的博客',
  description: '',
  head: [
    ['link', { rel: 'icon', href: '/icons/favicon.ico' }]
  ],

  theme: customTheme({
    // 自定义主题配置
  }),

  markdown: {
    headers: {
      level: [2, 3],
    },
  },

  plugins: [
    searchPlugin({
      locales: {
        '/': {
          placeholder: '搜索',
        },
      },
    }),
    blogPlugin({
      // Getting article info - 全局处理所有页面的元数据
      getInfo: ({ frontmatter, title, data }) => ({
        title: title || frontmatter.title,
        author: frontmatter.author || '',
        date: frontmatter.date || null,
        category: frontmatter.category || [],
        tag: frontmatter.tag || [],
        frontmatter: frontmatter
      }),
      type: [
        {
          key: 'article',
          // Only show posts directory, exclude archive articles
          filter: ({ filePathRelative, frontmatter }) =>
            filePathRelative &&
            filePathRelative.startsWith('posts/') &&
            !frontmatter.archive,
          layout: 'Article',
          frontmatter: () => ({
            title: 'Articles',
            sidebar: false,
          }),
          // Sort pages with time and sticky
          sorter: (pageA, pageB) => {
            if (pageA.frontmatter.sticky && pageB.frontmatter.sticky)
              return pageB.frontmatter.sticky - pageA.frontmatter.sticky

            if (pageA.frontmatter.sticky && !pageB.frontmatter.sticky) return -1

            if (!pageA.frontmatter.sticky && pageB.frontmatter.sticky) return 1

            if (!pageB.frontmatter.date) return 1
            if (!pageA.frontmatter.date) return -1

            return (
              new Date(pageB.frontmatter.date).getTime() -
              new Date(pageA.frontmatter.date).getTime()
            )
          },
        },
        {
          key: 'tools',
          // Only show tools directory
          filter: ({ filePathRelative }) =>
            filePathRelative ? filePathRelative.startsWith('tools/') : false,
          frontmatter: () => ({
            title: 'tools',
            sidebar: false,
          }),
          layout: 'tools', // 指定 tools.vue 作为布局
          path: '/tools/', // 访问路径为 /tools/
        },
        {
          key: 'project',
          // Only show projects directory
          filter: ({ filePathRelative }) =>
            filePathRelative ? filePathRelative.startsWith('projects/') : false,
          frontmatter: () => ({
            title: 'projects',
            sidebar: false,
          }),
          layout: 'project', // 指定 project.vue 作为布局
          path: '/projects/', // 访问路径为 /projects/
        }
      ],
      hotReload: true,
    }),
  ],

  bundler: viteBundler({
    viteOptions: {
      resolve: {
        alias: {
          '@mytheme': resolve(dirname(fileURLToPath(import.meta.url)), './theme'),
        }
      }
    }
  }),
})
