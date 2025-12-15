<script setup>
defineProps({
  /** Article items */
  items: {
    type: Array,
    required: true,
  },
  /** Whether is timeline or not */
  isTimeline: Boolean,
})
</script>

<template>
  <div v-if="!items.length">Nothing in here.</div>

  <article v-for="{ info, path } in items" :key="path" class="article" @click="$router.push(path)">
    <header class="title">
      {{
        (isTimeline ? `${new Date(info.date).toLocaleDateString()}: ` : '') +
        info.title
      }}
    </header>

    <div class="article-info">
      <span v-if="info.author" class="info-item author">
        {{ info.author }}
      </span>

      <span v-if="info.date && !isTimeline" class="info-item date">
        {{ new Date(info.date).toLocaleDateString() }}
      </span>

      <span v-if="info.category" class="info-item category">
        <span v-for="cat in info.category" :key="cat" class="chip">{{ cat }}</span>
      </span>

      <span v-if="info.tag" class="info-item tag">
        <span v-for="t in info.tag" :key="t" class="hash-tag">#{{ t }}</span>
      </span>
    </div>

    <!-- <div v-if="info.excerpt" class="excerpt" v-html="info.excerpt" /> -->
  </article>
</template>

<style lang="scss">
.article {
  position: relative;
  box-sizing: border-box;
  margin: 0 auto 1.5rem;
  padding: 1.5rem;
  border: 1px solid var(--c-border);
  border-radius: 8px;
  background-color: var(--c-bg);
  transition: all 0.3s ease;
  text-align: start;

  &:hover {
    cursor: pointer;
    transform: translateY(-2px);
    border-color: var(--c-brand);
  }

  .title {
    font-size: 1.4rem;
    font-weight: 600;
    line-height: 1.4;
    margin-bottom: 1rem;
    color: var(--c-text);
    transition: color 0.2s;
  }

  &:hover .title {
    color: var(--c-brand);
  }

  .article-info {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem;
    font-size: 0.9rem;
    color: var(--c-text-light);

    .info-item {
      display: flex;
      align-items: center;
    }

    .date {
      font-family: monospace;
      opacity: 0.8;
      background-color: var(--c-bg-light);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .category {
      .chip {
        background-color: var(--c-bg-light);
        color: var(--c-text);
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        margin-right: 0.5rem;
        transition: all 0.2s;

        &:last-child {
          margin-right: 0;
        }

        &:hover {
          background-color: var(--c-brand);
          color: white;
        }
      }
    }

    .tag {
      .hash-tag {
        color: var(--c-text-lighter);
        margin-right: 0.5rem;
        font-size: 0.85rem;

        &:hover {
          color: var(--c-brand);
        }
      }
    }
  }
}

/* 暗色模式适配 */
html.dark .article {
  border-color: var(--c-border);
  background-color: var(--c-bg);
}
</style>
