<template>
  <aside class="sidebar" v-if="headers.length > 0">
    <div class="sidebar-content">
      <p class="sidebar-title">目录</p>
      <div class="sidebar-toc">
        <template v-for="header in headers" :key="header.slug">
          <details v-if="header.level === 2" class="toc-h2" :id="'details-' + header.slug">
            <summary class="toc-summary" :class="{ 'no-children': !header.children || header.children.length === 0 }">
              <a :href="'#' + header.slug" class="sidebar-link" :class="{ active: activeHeader === header.slug }">{{ header.title }}</a>
            </summary>
            <ul v-if="header.children && header.children.length > 0" class="toc-children">
              <li v-for="child in header.children" :key="child.slug" class="toc-h3">
                <a :href="'#' + child.slug" class="sidebar-link" :class="{ active: activeHeader === child.slug }">{{ child.title }}</a>
              </li>
            </ul>
          </details>
          <div v-else-if="header.level === 3 && !header.parent" class="toc-h3-standalone">
            <a :href="'#' + header.slug" class="sidebar-link" :class="{ active: activeHeader === header.slug }">{{ header.title }}</a>
          </div>
        </template>
      </div>
    </div>
  </aside>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue'

export default {
  name: 'SidebarToc',
  props: {
    headers: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const activeHeader = ref('')

    const updateActiveHeader = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const offset = 100 // 偏移量，可以根据需要调整

      // 找到所有标题元素
      const headerElements = []
      props.headers.forEach(header => {
        const element = document.getElementById(header.slug)
        if (element) {
          headerElements.push({
            slug: header.slug,
            top: element.offsetTop
          })
        }
        if (header.children) {
          header.children.forEach(child => {
            const childElement = document.getElementById(child.slug)
            if (childElement) {
              headerElements.push({
                slug: child.slug,
                top: childElement.offsetTop
              })
            }
          })
        }
      })

      // 按位置排序
      headerElements.sort((a, b) => a.top - b.top)

      // 找到当前滚动位置对应的标题
      for (let i = headerElements.length - 1; i >= 0; i--) {
        if (scrollTop + offset >= headerElements[i].top) {
          activeHeader.value = headerElements[i].slug
          break
        }
      }
    }

    onMounted(() => {
      window.addEventListener('scroll', updateActiveHeader)
      // 初始更新
      updateActiveHeader()
    })

    onUnmounted(() => {
      window.removeEventListener('scroll', updateActiveHeader)
    })

    // 监听headers变化时重新计算
    watch(() => props.headers, () => {
      setTimeout(updateActiveHeader, 100) // 延迟执行，确保DOM已更新
    }, { deep: true })

    // 监听 activeHeader 变化，自动展开对应的 details
    watch(activeHeader, (newSlug) => {
      if (!newSlug) return

      // 查找对应的 header
      const findHeader = (slug) => {
        for (const header of props.headers) {
          if (header.slug === slug) return header
          if (header.children) {
            const child = header.children.find(c => c.slug === slug)
            if (child) return header // 返回父级 header
          }
        }
        return null
      }

      const parentHeader = findHeader(newSlug)
      if (parentHeader) {
        const detailsEl = document.getElementById('details-' + parentHeader.slug)
        if (detailsEl && !detailsEl.open) {
          detailsEl.open = true
        }
      }
    })

    return {
      activeHeader
    }
  }
}
</script>

<style scoped>
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

.toc-summary.no-children::before {
  visibility: hidden;
}

.toc-summary.no-children {
  cursor: default;
  pointer-events: none;
}

.toc-summary.no-children a {
  pointer-events: auto;
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

.sidebar-link.active {
  color: var(--c-brand);
  border-left-color: var(--c-brand);
  font-weight: 600;
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

.toc-children .sidebar-link.active {
  color: var(--c-brand);
}

/* 独立的 H3 */
.toc-h3-standalone .sidebar-link {
  padding-left: 2rem;
  font-size: 0.9rem;
}

@media (max-width: 719px) {
  .sidebar {
    display: none;
  }
}
</style>
