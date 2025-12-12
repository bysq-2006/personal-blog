<template>
  <div class="theme-container">
    <div class="theme-default-content">
      <h1>404</h1>
      <blockquote>{{ getMsg() }}</blockquote>
      <router-link to="/" class="action-button">返回首页</router-link>
    </div>
  </div>
</template>

<script>
const msgs = [
  '这里什么都没有。',
  '我们怎么到这儿来了？',
  '这是一个 404 页面。',
  '看起来我们迷路了。'
]

export default {
  name: 'NotFound',
  methods: {
    getMsg () {
      return msgs[Math.floor(Math.random() * msgs.length)]
    }
  }
}
</script>

<style scoped>
.theme-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--c-bg);
  color: var(--c-text);
}

.theme-default-content {
  text-align: center;
  padding: 2rem;
}

h1 {
  font-size: 6rem;
  font-weight: 600;
  margin: 0;
  color: var(--c-brand);
}

blockquote {
  font-size: 1.2rem;
  color: var(--c-text-light);
  border-left: none;
  margin: 1rem 0 2rem;
  padding: 0;
}

.action-button {
  display: inline-block;
  font-size: 1rem;
  color: #fff;
  background-color: var(--c-brand);
  padding: 0.8rem 1.6rem;
  border-radius: 4px;
  transition: background-color 0.1s ease;
  box-sizing: border-box;
  border-bottom: 1px solid var(--c-brand-dark);
}

.action-button:hover {
  background-color: var(--c-brand-light);
  text-decoration: none;
}
</style>