<template>
  <div class="category-wrapper">
    <slot />
  </div>
</template>

<script setup>
// CategoryWrapper 组件 - 用于居中显示分类内容
</script>

<style scoped>
.category-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 1200px;
  margin: 4rem auto;
  margin-bottom: 0rem;
  padding: 1rem;
  box-sizing: border-box;  /* 确保 padding 包含在 max-width 内 */
}

.category-wrapper h1 {
  text-align: center;
  margin-bottom: 2rem;
}

.category-wrapper ul {
  width: 100%;
}

.category-wrapper li {
  text-align: center;
  margin: 1rem 0;
  padding: 1rem;
  border: 1px solid var(--c-border);
  border-radius: 8px;
  background-color: var(--c-bg-light);
  transition: all 0.3s ease;
}

.category-wrapper li:hover {
  background-color: var(--c-bg-lighter);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.category-wrapper .no-content {
  text-align: center;
  color: var(--c-text-light);
  font-size: 1.1rem;
  padding: 3rem;
}

.category-wrapper .content-area {
  width: 100%;
  margin-top: 3rem;
}
</style>