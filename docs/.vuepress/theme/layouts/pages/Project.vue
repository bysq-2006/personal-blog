<template>
  <ParentLayout>
    <div style="height: 6rem;"></div>
    <template #page>
      <CategoryWrapper>

        <div class="github-profile" v-if="userInfo">
          <div class="avatar-wrapper">
            <img src="/images/GithubAvatar.png" alt="GitHub Avatar" class="avatar" />
          </div>
          <div class="info-wrapper">
            <div class="name-row">
              <a :href="'https://github.com/' + userInfo.login" target="_blank" class="login-link">{{ userInfo.login
                }}</a>
              <span class="name" v-if="userInfo.name">({{ userInfo.name }})</span>
            </div>
            <div class="bio" v-if="userInfo.bio">{{ userInfo.bio }}</div>
            <div class="stats-row">
              <div class="stat">
                <span class="label">Followers</span>
                <span class="value">{{ userInfo.followers }}</span>
              </div>
              <div class="stat">
                <span class="label">Following</span>
                <span class="value">{{ userInfo.following }}</span>
              </div>
              <div class="stat">
                <span class="label">Public Repos</span>
                <span class="value">{{ userInfo.public_repos }}</span>
              </div>
            </div>
            <div class="meta-row">
              <span class="label">Created At: </span>
              <span class="value">{{ formatDate(userInfo.created_at) }}</span>
            </div>
          </div>
        </div>
        <div v-if="projectList.length > 0" class="project-grid">
          <div v-for="project in projectList" :key="project.path" class="project-card">
            <div class="card-top">
              <div class="card-title">
                <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16"
                  data-view-component="true" class="octicon octicon-repo mr-1 color-fg-muted">
                  <path
                    d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z">
                  </path>
                </svg>
                <a :href="project.path" class="repo-link">{{ project.name }}</a>
              </div>
              <div class="card-desc">{{ project.description }}</div>
            </div>
            <div class="card-meta">
              <div class="meta-item" v-if="project.language">
                <span class="lang-color" :style="{ backgroundColor: getLanguageColor(project.language) }"></span>
                <span>{{ project.language }}</span>
              </div>
              <div class="meta-item">
                <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16"
                  data-view-component="true" class="octicon octicon-star">
                  <path
                    d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z">
                  </path>
                </svg>
                <span>{{ project.stargazers_count }}</span>
              </div>
              <div class="meta-item">
                <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16"
                  data-view-component="true" class="octicon octicon-eye">
                  <path
                    d="M8 2c1.981 0 3.671.992 4.933 2.078 1.27 1.091 2.187 2.345 2.637 3.023a1.62 1.62 0 0 1 0 1.798c-.45.678-1.367 1.932-2.637 3.023C11.67 13.008 9.981 14 8 14c-1.981 0-3.671-.992-4.933-2.078C1.797 10.83.88 9.576.43 8.898a1.62 1.62 0 0 1 0-1.798c.45-.678 1.367-1.932 2.637-3.023C4.33 2.992 6.019 2 8 2ZM1.679 7.932a.12.12 0 0 0 0 .136c.411.622 1.241 1.75 2.366 2.717C5.176 11.758 6.527 12.5 8 12.5c1.473 0 2.825-.742 3.955-1.715 1.124-.967 1.954-2.096 2.366-2.717a.12.12 0 0 0 0-.136c-.412-.621-1.242-1.75-2.366-2.717C10.824 4.242 9.473 3.5 8 3.5c-1.473 0-2.825.742-3.955 1.715-1.124.967-1.954 2.096-2.366 2.717ZM8 10a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z">
                  </path>
                </svg>
                <span>{{ project.subscribers_count }}</span>
              </div>
              <div class="meta-item" v-if="project.license">
                <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16"
                  data-view-component="true" class="octicon octicon-law">
                  <path
                    d="M8.75.75V2h.985c.304 0 .603.08.867.231l1.29.736c.038.022.08.033.124.033h2.234a.75.75 0 0 1 0 1.5h-.427l2.111 4.692a.75.75 0 0 1-.154.838l-.53-.53.529.531-.001.002-.002.002-.006.006-.006.005-.01.01-.045.04c-.21.176-.441.327-.686.45C13.556 10.943 11.372 11.5 8 11.5c-3.372 0-5.556-.557-7.179-.947a6.102 6.102 0 0 1-.686-.45l-.045-.04-.016-.015-.006-.006-.004-.004v-.001a.75.75 0 0 1-.154-.838L2.178 4.5H1.75a.75.75 0 0 1 0-1.5h2.234a.249.249 0 0 0 .125-.033l1.29-.736A1.75 1.75 0 0 1 6.266 2h.984V.75a.75.75 0 0 1 1.5 0Zm2.945 8.477c.285.003.593.028.899.115 2.444.693 3.008 2.349 3.008 2.827V14.5a.75.75 0 0 1-.75.75H1.149a.75.75 0 0 1-.75-.75v-2.331c0-.478.564-2.134 3.008-2.827.306-.087.614-.112.899-.115l-.004-.623-.003-.002-.073-.027a7.627 7.627 0 0 0-.43-.13c-1.202-.322-2.674-.545-4.296-.545-1.622 0-3.094.223-4.296.545a7.627 7.627 0 0 0-.43.13l-.073.027c-.001 0-.002.001-.003.002l-.004.623ZM1.149 13.75h13.702v-1.583c-.002-.018-.01-.104-.135-.381-.204-.454-.744-1.216-3.217-1.919-1.08-.306-2.35-.467-3.5-.467-1.15 0-2.42.161-3.5.467-2.473.703-3.013 1.465-3.217 1.919-.125.277-.133.363-.135.381v1.583ZM8 9.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0-1.5a.5.5 0 1 1 0 1 .5.5 0 0 1 0-1Z">
                  </path>
                </svg>
                <span>{{ project.license }}</span>
              </div>
            </div>
          </div>
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
import { ref, onMounted, watch } from 'vue'

const projects = useBlogType('project')
const userInfo = ref({
  login: '',
  name: '',
  bio: '',
  followers: 0,
  following: 0,
  public_repos: 0,
  created_at: ''
})

const projectList = ref([])

const languageColors = {
  JavaScript: '#f1e05a',
  TypeScript: '#2b7489',
  Vue: '#41b883',
  Python: '#3572A5',
  Java: '#b07219',
  HTML: '#e34c26',
  CSS: '#563d7c',
  'C++': '#f34b7d',
  C: '#555555',
  Shell: '#89e051',
  Go: '#00ADD8',
  Rust: '#dea584'
}

const getLanguageColor = (lang) => {
  return languageColors[lang] || '#8b9bb4'
}

watch(() => projects.value, (newProjects) => {
  if (newProjects && newProjects.items) {
    const list = newProjects.items.map(item => {
      const githubUrl = item.info?.frontmatter?.github
      return {
        path: item.path,
        name: item.info?.title || 'Untitled',
        description: item.info?.frontmatter?.description || '好像没有写描述~',
        githubUrl: githubUrl,
        language: 'Markdown',
        stargazers_count: 0,
        subscribers_count: 0,
        license: null,
        isLoaded: false
      }
    })
    
    projectList.value = list

    // Load GitHub data for each project
    list.forEach(async (project, index) => {
      if (project.githubUrl) {
        try {
          // Extract owner and repo from URL
          // Format: https://github.com/owner/repo
          const match = project.githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/)
          if (match) {
            const owner = match[1]
            const repo = match[2]
            const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`)
            if (res.ok) {
              const data = await res.json()
              // Ensure we are updating the correct item in the reactive list
              if (projectList.value[index] && projectList.value[index].path === project.path) {
                projectList.value[index] = {
                  ...projectList.value[index],
                  name: data.name,
                  description: data.description || project.description,
                  language: data.language,
                  stargazers_count: data.stargazers_count,
                  subscribers_count: data.subscribers_count, // Watchers
                  license: data.license ? data.license.spdx_id || data.license.name : null,
                  isLoaded: true
                }
              }
            }
          }
        } catch (e) {
          console.error(`Failed to fetch repo info for ${project.name}:`, e)
        }
      }
    })
  }
}, { immediate: true })

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('zh-CN')
}

onMounted(async () => {
  try {
    const res = await fetch('https://api.github.com/users/bysq-2006')
    if (res.ok) {
      userInfo.value = await res.json()
    }
  } catch (e) {
    console.error('Failed to fetch GitHub profile:', e)
  }
})
</script>

<style scoped lang="scss">
.github-profile {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-bottom: 3rem;
  padding: 2rem;
  border-radius: 10px;
  width: 90%;
  margin: 0 auto;

  .avatar-wrapper {
    flex-shrink: 0;

    .avatar {
      width: 140px;
      border-radius: 50%;
      object-fit: cover;
    }
  }

  .info-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;

    .name-row {
      display: flex;
      align-items: baseline;
      gap: 0.8rem;

      .login-link {
        font-size: 1.8rem;
        font-weight: bold;
        color: var(--c-text);
        text-decoration: none;
        transition: color 0.3s ease;

        &:hover {
          color: var(--c-brand);
        }
      }

      .name {
        font-size: 1.2rem;
        color: var(--c-text-light);
      }
    }

    .bio {
      font-size: 1rem;
      color: var(--c-text-quote);
      line-height: 1.5;
    }

    .stats-row {
      display: flex;
      gap: 3rem;
      margin-top: 0.5rem;

      .stat {
        display: flex;
        flex-direction: column;
        align-items: center;

        .value {
          font-size: 1.2rem;
          font-weight: bold;
          color: var(--c-brand);
        }

        .label {
          font-size: 0.8rem;
          color: var(--c-text-lighter);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      }
    }

    .meta-row {
      margin-top: 0.5rem;
      font-size: 0.9rem;
      color: var(--c-text-light);

      .label {
        font-weight: 500;
      }
    }
  }
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  width: 100%;
  margin: 1rem auto;
}

.project-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
  padding: 1rem;
  border: 1px solid var(--c-border);
  border-radius: 6px;
  background: var(--c-bg);
  transition: all 0.3s ease;
  height: 100%;
  min-height: 120px;

  &:hover {
    border-color: var(--c-text-light);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .card-top {
    margin-bottom: 1rem;
  }

  .card-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    font-weight: 600;
    font-size: 1rem;

    .repo-link {
      color: var(--c-brand);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }

    svg {
      fill: var(--c-text-light);
    }
  }

  .card-desc {
    font-size: 0.85rem;
    color: var(--c-text-light);
    line-height: 1.5;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 0.75rem;
    color: var(--c-text-light);
    margin-top: auto;

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.25rem;

      svg {
        fill: var(--c-text-light);
      }
    }

    .lang-color {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      display: inline-block;
    }
  }
}

@media (max-width: 719px) {
  .github-profile {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1.5rem;

    .info-wrapper {
      align-items: center;

      .name-row {
        justify-content: center;
      }
    }
  }
}
</style>