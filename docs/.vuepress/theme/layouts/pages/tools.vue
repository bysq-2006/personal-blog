<template>
  <ParentLayout>
    <template #page>
      <CategoryWrapper>
        <h1> 工具 </h1>
        <div class="tools-container">
          <div v-if="tools && tools.items && tools.items.length > 0" class="tools-grid">
            <div v-for="tool in tools.items" :key="tool.path" class="tool-card">
              <router-link :to="tool.path" class="tool-link">
                <div class="card-content">
                  <h3 class="tool-title">
                    {{ tool.info?.title || tool.title }}
                  </h3>
                  <div class="tool-excerpt" v-if="tool.info?.excerpt || tool.excerpt">
                    <div v-html="tool.info?.excerpt || tool.excerpt"></div>
                  </div>
                  <div class="tool-arrow">→</div>
                </div>
              </router-link>
            </div>
          </div>
          
          <div v-else class="no-content">
            <div class="empty-box">
              <p>暂无工具收录</p>
            </div>
          </div>

          <div class="content-area">
            <Content />
          </div>
        </div>
      </CategoryWrapper>
    </template>
  </ParentLayout>
</template>

<script setup name="ToolsLayout">
import { useBlogType } from '@vuepress/plugin-blog/client'

const tools = useBlogType('tools')
</script>

<style scoped>
.tools-container {
  width: 100%;
  margin: 0 auto;
  padding: 3rem 1.5rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
}

/* 网格布局 */
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem; /* 卡片间距 */
}

/* 卡片基础样式 - 强调线条 */
.tool-card {
  border: 1px solid #e5e5e5; /* 浅灰细边框 */
  background-color: transparent;
  transition: all 0.3s ease;
  position: relative;
  height: 100%;
  box-sizing: border-box;
}

/* 悬停效果 - 边框变深，不使用阴影保持扁平 */
.tool-card:hover {
  border-color: #333;
  background-color: #fafafa;
}

.tool-link {
  display: block;
  text-decoration: none;
  color: inherit;
  height: 100%;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.card-content {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 标题样式 */
.tool-title {
  margin: 0 0 0.8rem 0;
  font-size: 1.1rem;
  font-weight: 500;
  color: #2c3e50;
  letter-spacing: 0.5px;
  position: relative;
  padding-bottom: 0.8rem;
}

/* 标题下的动态线条 */
.tool-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 1.5rem; /* 初始长度 */
  height: 1px; /* 极细线条 */
  background-color: #2c3e50;
  transition: width 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.tool-card:hover .tool-title::after {
  width: 100%; /* 悬停时延伸至全长 */
}

/* 摘要/描述文字 */
.tool-excerpt {
  font-size: 0.85rem;
  color: #666;
  line-height: 1.5;
  flex-grow: 1;
  margin-bottom: 1rem;
  opacity: 0.8;
}

/* 右下角箭头装饰 */
.tool-arrow {
  position: absolute;
  bottom: 0;
  right: 0;
  font-size: 1.2rem;
  color: #ccc;
  transition: all 0.3s ease;
  line-height: 1;
}

.tool-card:hover .tool-arrow {
  color: #333;
  transform: translateX(3px);
}

/* 无内容状态 */
.no-content {
  display: flex;
  justify-content: center;
  padding: 4rem 0;
}

.empty-box {
  border: 1px dashed #ccc;
  padding: 2rem 4rem;
  color: #999;
  letter-spacing: 1px;
}

.content-area {
  margin-top: 4rem;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .tools-grid {
    grid-template-columns: 1fr; /* 手机端单列 */
  }
  
  .tool-card {
    min-height: auto;
  }
}
</style>