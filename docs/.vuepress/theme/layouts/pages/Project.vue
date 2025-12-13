<template>
  <ParentLayout>
    <div style="height: 6rem;"></div>
    <template #page>
      <CategoryWrapper>
        <div v-if="projects && projects.items && projects.items.length > 0">
          <ul>
            <li v-for="project in projects.items" :key="project.path">
              <router-link :to="project.path">{{ project.info?.title || project.title }}</router-link>
            </li>
          </ul>
        </div>
        <div v-else class="no-content">
          <p>暂无项目</p>
        </div>
        <div class="content-area">
          <Content />
        </div>
      </CategoryWrapper>
    </template>
  </ParentLayout>
</template>

<script setup name="ProjectsLayout">
import { useBlogType } from '@vuepress/plugin-blog/client'

const projects = useBlogType('project')
</script>

<style scoped>
</style>