<template>
  <div class="theme-container">
    <header class="navbar">
      <div class="navbar-inner">
        <div class="navbar-brand">
          <router-link to="/" class="brand-link">
            <span class="site-name">{{ $site.title }}</span>
          </router-link>
        </div>
        <div class="navbar-items">
          <SearchBox />
          <nav class="navbar-nav">
            <router-link to="/" class="nav-link">首页</router-link>
            <router-link to="/article/" class="nav-link">文章</router-link>
            <router-link to="/category/" class="nav-link">分类</router-link>
          </nav>
          <button @click="toggleDarkMode" class="dark-mode-toggle" :title="isDark ? '切换到亮色模式' : '切换到暗色模式'">
            {{ isDark ? '暗' : '亮' }}
          </button>
        </div>
      </div>
    </header>

    <slot name="page">
      <div class="page-wrapper">
        <aside class="sidebar" v-if="headers.length > 0">
          <div class="sidebar-content">
            <p class="sidebar-title">目录</p>
            <div class="sidebar-toc">
              <template v-for="header in headers" :key="header.slug">
                <details v-if="header.level === 2" class="toc-h2">
                  <summary class="toc-summary">
                    <a :href="'#' + header.slug" class="sidebar-link">{{ header.title }}</a>
                  </summary>
                  <ul v-if="header.children && header.children.length > 0" class="toc-children">
                    <li v-for="child in header.children" :key="child.slug" class="toc-h3">
                      <a :href="'#' + child.slug" class="sidebar-link">{{ child.title }}</a>
                    </li>
                  </ul>
                </details>
                <div v-else-if="header.level === 3 && !header.parent" class="toc-h3-standalone">
                  <a :href="'#' + header.slug" class="sidebar-link">{{ header.title }}</a>
                </div>
              </template>
            </div>
          </div>
        </aside>
        <main class="page" :class="{ 'has-sidebar': headers.length > 0 }">
          <div class="theme-default-content">
            <Content />
          </div>
        </main>
      </div>
    </slot>

    <footer class="footer">
      <div class="footer-content">
        © {{ new Date().getFullYear() }} {{ $site.title }}. Powered by VuePress.
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, onMounted, defineAsyncComponent, computed } from 'vue'
import { usePageData } from 'vuepress/client'

// 异步加载搜索框组件，避免 SSR 问题
const SearchBox = defineAsyncComponent(() =>
  import('@vuepress/plugin-search/client').then(m => m.SearchBox).catch(() => ({
    render: () => null
  }))
)

export default {
  name: 'Layout',
  components: {
    SearchBox,
  },
  setup() {
    const isDark = ref(false)
    const pageData = usePageData()

    // 获取页面标题列表
    const headers = computed(() => {
      return pageData.value.headers || []
    })

    const toggleDarkMode = () => {
      isDark.value = !isDark.value
      const html = document.documentElement
      if (isDark.value) {
        html.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else {
        html.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }
    }

    onMounted(() => {
      const savedTheme = localStorage.getItem('theme')
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

      if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        isDark.value = true
        document.documentElement.classList.add('dark')
      }
    })

    return {
      isDark,
      toggleDarkMode,
      headers
    }
  }
}
</script>

<style>
:root {
  --c-brand: #3eaf7c;
  --c-brand-light: #4abf8a;
  --c-text: #2c3e50;
  --c-text-light: #3a5169;
  --c-text-lighter: #4e6e8e;
  --c-bg: #ffffff;
  --c-bg-light: #f3f4f5;
  --c-bg-lighter: #eeeeee;
  --c-border: #eaecef;
  --c-border-dark: #dfe2e5;

  --navbar-height: 3.6rem;
}

html.dark {
  --c-brand: #3eaf7c;
  --c-brand-light: #4abf8a;
  --c-text: #adbac7;
  --c-text-light: #96a2b0;
  --c-text-lighter: #768390;
  --c-bg: #22272e;
  --c-bg-light: #2d333b;
  --c-bg-lighter: #373e47;
  --c-border: #444c56;
  --c-border-dark: #535f6e;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 16px;
  color: var(--c-text);
  background-color: var(--c-bg);
  margin: 0;
}

a {
  font-weight: 500;
  text-decoration: none;
  color: var(--c-brand);
}

a:hover {
  color: var(--c-brand-light);
}

/* SearchBox 暗黑模式适配 */
html.dark .search-box input {
  color: var(--c-text);
  background-color: var(--c-bg-light);
  border-color: var(--c-border);
}

html.dark .search-box input:focus {
  border-color: var(--c-brand);
  background-color: var(--c-bg);
}

html.dark .search-box .suggestions {
  background-color: var(--c-bg);
  border-color: var(--c-border);
}

html.dark .search-box .suggestions .suggestion a {
  color: var(--c-text);
}

html.dark .search-box .suggestions .suggestion.focused a {
  color: var(--c-brand);
}

html.dark .search-box .suggestions .suggestion.focused {
  background-color: var(--c-bg-light);
}
</style>

<style scoped>
.theme-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  position: fixed;
  z-index: 20;
  top: 0;
  left: 0;
  right: 0;
  height: var(--navbar-height);
  background-color: var(--c-bg);
  box-sizing: border-box;
  border-bottom: 1px solid var(--c-border);
  transition: background-color 0.3s, border-color 0.3s;
}

.navbar-inner {
  padding: 0 1.5rem;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 100%;
}

.site-name {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--c-text);
}

.navbar-items {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.navbar-nav {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  color: var(--c-text);
  font-size: 0.9rem;
  line-height: 1.4rem;
  transition: color 0.3s;
  display: inline-block;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--c-brand);
}

.dark-mode-toggle {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0 0.5rem;
  color: var(--c-text);
  transition: transform 0.3s;
}

.dark-mode-toggle:hover {
  transform: scale(1.1);
}

.page {
  flex: 1;
  padding-top: var(--navbar-height);
  display: block;
}

.page-wrapper {
  display: flex;
  padding-top: var(--navbar-height);
  min-height: calc(100vh - var(--navbar-height));
}

.sidebar {
  position: fixed;
  top: var(--navbar-height);
  left: 0;
  width: 16rem;
  height: calc(100vh - var(--navbar-height));
  overflow-y: auto;
  border-right: 1px solid var(--c-border);
  background-color: var(--c-bg);
  padding: 1.5rem;
  box-sizing: border-box;
  transition: all 0.3s;
}

.sidebar-content {
  position: sticky;
  top: 0;
}

.sidebar-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--c-text-lighter);
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.sidebar-toc {
  margin: 0;
}

.toc-h2 {
  margin: 0;
}

.toc-summary {
  cursor: pointer;
  list-style: none;
  margin: 0;
  display: flex;
  align-items: center;
  user-select: none;
}

.toc-summary::-webkit-details-marker,
.toc-summary::marker {
  display: none;
}

.toc-summary::before {
  content: "▶";
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  font-size: 0.75rem;
  color: var(--c-text-quote);
  transition: transform 0.2s;
  flex-shrink: 0;
}

details[open]>.toc-summary::before {
  transform: rotate(90deg);
}

.toc-children {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-h3 {
  margin: 0;
}

.toc-h3-standalone {
  margin: 0;
}

.sidebar-link {
  display: block;
  padding: 0.35rem 0;
  font-size: 0.95rem;
  color: var(--c-text);
  line-height: 1.4;
  border-left: 2px solid transparent;
  padding-left: 0.5rem;
  text-decoration: none;
  transition: color 0.2s, border-color 0.2s;
  flex-grow: 1;
}

.sidebar-link:hover {
  color: var(--c-brand);
  border-left-color: var(--c-brand);
}

/* H3 样式 - 增加缩进 */
.toc-children .sidebar-link {
  padding-left: 2rem;
  font-size: 0.9rem;
  color: var(--c-text-light);
}

.toc-children .sidebar-link:hover {
  color: var(--c-brand);
}

/* 独立的 H3 */
.toc-h3-standalone .sidebar-link {
  padding-left: 2rem;
  font-size: 0.9rem;
}

.page.has-sidebar {
  margin-left: 16rem;
  padding-top: 0;
}

.theme-default-content {
  max-width: 740px;
  margin: 0 auto;
  padding: 2rem 2.5rem;
}

.footer {
  padding: 2rem;
  border-top: 1px solid var(--c-border);
  text-align: center;
  color: var(--c-text-light);
  background-color: var(--c-bg);
  transition: border-color 0.3s, background-color 0.3s;
}

@media (max-width: 719px) {
  .navbar-nav {
    display: none;
  }

  .sidebar {
    display: none;
  }

  .page.has-sidebar {
    margin-left: 0;
  }
}
</style>