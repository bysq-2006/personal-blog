<template>
  <div class="theme-container">
    <header class="navbar" :class="{ 'navbar-hidden': isNavbarHidden }">
      <div class="navbar-inner">
        <div class="navbar-brand">
          <router-link to="/" class="brand-link">
            <img src="/icons/favicon.ico" alt="Logo" class="brand-logo" />
          </router-link>
        </div>
        <div class="navbar-items">
          <SearchBox />
          <nav class="navbar-nav">
            <router-link to="/" class="nav-link">首页</router-link>
            <router-link to="/article/" class="nav-link">文章</router-link>
            <router-link to="/tools/" class="nav-link">工具</router-link>
            <router-link to="/projects/" class="nav-link">项目</router-link>
          </nav>
          <button @click="toggleMenu" class="hamburger-btn" :class="{ active: isMenuOpen }">
            <span></span>
            <span></span>
            <span></span>
          </button>
          <button @click="toggleDarkMode" class="dark-mode-toggle" :title="isDark ? '切换到亮色模式' : '切换到暗色模式'">
            <transition name="icon-twist" mode="out-in">
              <SvgIcon :name="isDark ? 'dark' : 'bright'" :key="isDark ? 'dark' : 'bright'" />
            </transition>
          </button>
        </div>
      </div>
    </header>

    <!-- 移动端下拉菜单 -->
    <transition name="menu-fade">
      <div v-if="isMenuOpen" class="mobile-menu" @click="toggleMenu">
        <div class="mobile-menu-content" @click.stop>
          <router-link to="/" class="mobile-nav-link" @click="toggleMenu">首页</router-link>
          <router-link to="/article/" class="mobile-nav-link" @click="toggleMenu">文章</router-link>
          <router-link to="/tools/" class="mobile-nav-link" @click="toggleMenu">工具</router-link>
          <router-link to="/projects/" class="mobile-nav-link" @click="toggleMenu">项目</router-link>
        </div>
      </div>
    </transition>

    <slot name="page">
      <div class="page-wrapper">
        <SidebarToc :headers="headers" />
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

<script setup>
import { ref, onMounted, defineAsyncComponent, computed } from 'vue'
import { usePageData } from 'vuepress/client'
import SvgIcon from './SvgIcon.vue'
import SidebarToc from './SidebarToc.vue'
const SearchBox = defineAsyncComponent(() =>
  // 异步加载搜索框组件，避免 SSR 问题
  import('@vuepress/plugin-search/client').then(m => m.SearchBox).catch(() => ({
    render: () => null
  }))
)

const isDark = ref(false)
const pageData = usePageData()
const isMenuOpen = ref(false)
const isNavbarHidden = ref(false)

let lastScrollY = 0

// 获取页面标题列表
const headers = computed(() => {
  return pageData.value.headers || []
})

// 切换暗黑模式
const toggleDarkMode = () => {
  isDark.value = !isDark.value
  const html = document.documentElement
  if (isDark.value) {
    html.classList.add('dark')
    html.dataset.theme = 'dark'
    localStorage.setItem('theme', 'dark')
  } else {
    html.classList.remove('dark')
    html.dataset.theme = 'light'
    localStorage.setItem('theme', 'light')
  }
}

// 切换移动端菜单显示状态
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

// 处理滚动事件，显示或隐藏导航栏s
const handleScroll = () => {
  const currentScrollY = window.scrollY
  if (currentScrollY > lastScrollY) {
    isNavbarHidden.value = true
  } else {
    isNavbarHidden.value = false
  }
  lastScrollY = currentScrollY
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    isDark.value = true
    document.documentElement.classList.add('dark')
    document.documentElement.dataset.theme = 'dark'
  } else {
    document.documentElement.dataset.theme = 'light'
  }
  // 添加滚动监听
  window.addEventListener('scroll', handleScroll, { passive: true })
})
</script>

<style lang="scss">
:root {
  --c-brand: #0284c7;
  --c-brand-light: #38bdf8;
  --c-text: #334155;
  --c-text-light: #64748b;
  --c-text-lighter: #94a3b8;
  --c-bg: #ffffff;
  --c-bg-light: #f0f9ff;
  --c-bg-lighter: #e0f2fe;
  --c-border: #c1c7ce;
  --c-border-dark: #cbd5e1;

  --navbar-height: 3.6rem;
}

html.dark {
  --c-brand: #38bdf8;
  --c-brand-light: #7dd3fc;
  --c-text: #f1f5f9;
  --c-text-light: #cbd5e1;
  --c-text-lighter: #94a3b8;
  --c-bg: #0f172a;
  /* 暗黑背景：深蓝黑 */
  --c-bg-light: #1e293b;
  --c-bg-lighter: #334155;
  --c-border: #334155;
  --c-border-dark: #384454;
  /* 回到顶部按钮暗色模式 */
  --back-to-top-c-bg: var(--c-bg-light);
  --back-to-top-c-accent-bg: var(--c-brand);
  --back-to-top-c-shadow: rgba(0, 0, 0, 0.3);
  --back-to-top-c-accent-hover: var(--c-brand-light);
  --back-to-top-c-icon: var(--c-text);
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

  &:hover {
    color: var(--c-brand-light);
  }
}

/* SearchBox 适配米黄色暖色调 */
.search-box {
  input {
    color: var(--c-text);
    background-color: var(--c-bg-light);
    border: 1px solid var(--c-border);
    transition: border-color 0.2s, background-color 0.2s, box-shadow 0.2s;

    &:focus {
      border-color: var(--c-brand);
      background-color: var(--c-bg);
      outline: none;
      box-shadow: 0 0 0 1px var(--c-brand-light, #f59e0b33);
    }
  }

  .suggestions {
    background-color: var(--c-bg);
    border: 1px solid var(--c-border);
    border-radius: 8px;

    .suggestion {
      a {
        color: var(--c-text);
        padding: 0.3em 1em;
        border-radius: 4px;
        transition: background 0.2s, color 0.2s;
      }

      &:hover,
      &.focused {
        background-color: var(--c-brand);

        a {
          color: #fff;
          background: none;
        }
      }
    }
  }
}

html.dark .search-box {
  input {
    color: var(--c-text);
    background-color: var(--c-bg-light);
    border-color: var(--c-border);

    &:focus {
      border-color: var(--c-brand);
      background-color: var(--c-bg);
    }
  }

  .suggestions {
    background-color: var(--c-bg);
    border-color: var(--c-border);

    .suggestion {
      a {
        color: var(--c-text);
      }

      &.focused {
        background-color: var(--c-bg-light);

        a {
          color: var(--c-brand);
          background: var(--c-bg-light);
        }
      }
    }
  }
}

/* 返回顶部按钮适配 */
.vp-back-to-top-button {
  background: var(--c-bg-light) !important;
  color: var(--c-brand) !important;
}
</style>

<style scoped lang="scss">
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
  transition: background-color 0.3s, border-color 0.3s, transform 0.3s ease;

  &-hidden {
    transform: translateY(-100%);
  }

  &-inner {
    padding: 0 1.5rem;
    height: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 100%;
  }

  &-items {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    height: 100%;
  }

  &-nav {
    display: flex;
    gap: 1.5rem;
    height: 100%;
    align-items: center;
  }
}

.brand-logo {
  height: 2rem;
  margin-right: 0.5rem;
  vertical-align: middle;
  transform: translateY(-0.24rem);
}

.hamburger-btn {
  display: none;
  position: relative;
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;

  span {
    position: absolute;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: var(--c-text);
    border-radius: 2px;
    transition: all 0.3s;
    transform-origin: center;
  }

  span:nth-child(1) {
    top: 5px;
  }

  span:nth-child(2) {
    top: 11px;
  }

  span:nth-child(3) {
    top: 17px;
  }

  &.active {
    span:nth-child(1) {
      top: 11px;
      transform: rotate(45deg);
    }

    span:nth-child(2) {
      opacity: 0;
    }

    span:nth-child(3) {
      top: 11px;
      transform: rotate(-45deg);
    }
  }
}

.mobile-menu {
  position: fixed;
  top: var(--navbar-height);
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 19;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 2rem;

  &-content {
    background-color: var(--c-bg);
    border-radius: 8px;
    padding: 1rem;
    min-width: 200px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
}

.mobile-nav-link {
  display: block;
  color: var(--c-text);
  text-decoration: none;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover,
  &.router-link-active {
    background-color: var(--c-bg-light);
    color: var(--c-brand);
  }
}

.menu-fade {

  &-enter-active,
  &-leave-active {
    transition: opacity 0.3s;
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
  }
}

.nav-link {
  color: var(--c-text);
  font-size: 0.9rem;
  line-height: 1.4rem;
  transition: color 0.3s;
  display: inline-flex;
  align-items: center;
  height: 100%;

  &:hover,
  &.router-link-active {
    color: var(--c-brand);
  }
}

.dark-mode-toggle {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0 0.5rem;
  color: var(--c-text);
  transition: transform 0.3s;

  &:hover {
    transform: scale(1.1);
  }
}

.icon-twist {

  &-enter-active,
  &-leave-active {
    transition: all 0.2s cubic-bezier(.68, -0.55, .27, 1.55);
  }

  &-enter-from {
    opacity: 0;
    transform: rotate(-180deg) scale(0.5);
  }

  &-leave-to {
    opacity: 0;
    transform: rotate(180deg) scale(0.5);
  }

  &-enter-to,
  &-leave-from {
    opacity: 1;
    transform: rotate(0deg) scale(1);
  }
}

.page {
  flex: 1;
  display: block;

  &-wrapper {
    display: flex;
    padding-top: var(--navbar-height);
    min-height: calc(100vh - var(--navbar-height));
  }

  &.has-sidebar {
    margin-left: 16rem;
    padding-top: 0;
  }
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

  .hamburger-btn {
    display: flex;
  }

  .page.has-sidebar {
    margin-left: 0;
  }
}
</style>