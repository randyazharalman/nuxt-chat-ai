// components/tool/Summarize.vue
<script setup lang="ts">
import type { SummarizeToolUIPart } from '~/utils/tools/summarize'

const { state, output } = defineProps<{
  state: SummarizeToolUIPart['state']
  output: SummarizeToolUIPart['output']
}>()

const getStyleIcon = (style?: string) => {
  const icons: Record<string, string> = {
    'brief': 'i-lucide-file-text',
    'detailed': 'i-lucide-file-line-chart',
    'bullet-points': 'i-lucide-list'
  }
  return icons[style || 'brief'] || 'i-lucide-file-text'
}

const getStyleLabel = (style?: string) => {
  const labels: Record<string, string> = {
    'brief': 'Brief Summary',
    'detailed': 'Detailed Summary',
    'bullet-points': 'Bullet Points'
  }
  return labels[style || 'brief'] || 'Summary'
}

const compressionRate = computed(() => {
  if (!output?.originalLength || !output?.summaryLength) return 0
  return Math.round((1 - output.summaryLength / output.originalLength) * 100)
})
</script>

<template>
  <div v-if="state === 'output-available'" class="max-w-2xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-5 border border-purple-200 dark:border-purple-800">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <UIcon
          :name="getStyleIcon(output.style)"
          class="size-5 text-purple-600 dark:text-purple-400"
        />
        <span class="font-semibold text-purple-900 dark:text-purple-100">
          {{ getStyleLabel(output.style) }}
        </span>
      </div>
      <div class="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400">
        <UIcon name="i-lucide-trending-down" class="size-4" />
        <span>{{ compressionRate }}% shorter</span>
      </div>
    </div>

    <!-- Summary Text -->
    <div class="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
      <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
        {{ output.summary }}
      </p>
    </div>

    <!-- Key Points -->
    <div v-if="output.keyPoints && output.keyPoints.length > 0">
      <div class="flex items-center gap-2 mb-3">
        <UIcon name="i-lucide-lightbulb" class="size-4 text-purple-600 dark:text-purple-400" />
        <span class="text-sm font-medium text-purple-900 dark:text-purple-100">
          Key Points
        </span>
      </div>
      <div class="space-y-2">
        <div
          v-for="(point, index) in output.keyPoints"
          :key="index"
          class="flex gap-2 text-sm"
        >
          <span class="text-purple-600 dark:text-purple-400 font-medium">{{ index + 1 }}.</span>
          <span class="text-gray-700 dark:text-gray-300">{{ point }}</span>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="flex items-center justify-between mt-4 pt-4 border-t border-purple-200 dark:border-purple-800">
      <div class="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
        <div class="flex items-center gap-1">
          <UIcon name="i-lucide-file-input" class="size-3" />
          <span>{{ output.originalLength }} chars</span>
        </div>
        <div class="flex items-center gap-1">
          <UIcon name="i-lucide-file-output" class="size-3" />
          <span>{{ output.summaryLength }} chars</span>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="state === 'input-available'" class="max-w-2xl bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-xl p-5 border border-purple-300 dark:border-purple-700">
    <div class="flex items-center justify-center gap-3 py-4">
      <UIcon
        name="i-lucide-loader-2"
        class="size-6 text-purple-600 dark:text-purple-400 animate-spin"
      />
      <span class="text-sm text-purple-900 dark:text-purple-100">
        Analyzing and summarizing content...
      </span>
    </div>
  </div>

  <div v-else-if="state === 'output-error'" class="max-w-2xl bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-5 border border-red-200 dark:border-red-800">
    <div class="flex items-center justify-center gap-3 py-4">
      <UIcon
        name="i-lucide-alert-triangle"
        class="size-6 text-red-600 dark:text-red-400"
      />
      <span class="text-sm text-red-900 dark:text-red-100">
        Failed to generate summary. Please try again.
      </span>
    </div>
  </div>
</template>