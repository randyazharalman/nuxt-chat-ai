<script setup lang="ts">
import { useColorMode } from "@vueuse/core";
import type { ThemeToolUIPart } from "~/utils/tools/theme";
import { Moon, Sun } from "lucide-vue-next";

const { state, output } = defineProps<{
  state: ThemeToolUIPart["state"];
  output: ThemeToolUIPart["output"];
}>();

const colorMode = useColorMode();

const isDark = computed({
  get: () => colorMode.value === "dark",
  set: (val: boolean) => {
    colorMode.value = val ? "dark" : "light";
  },
});
</script>

<template>
  <div
    v-if="state === 'output-available' || state === 'input-available'"
    class="w-[480px] rounded-xl px-5 py-4 bg-muted/50 text-highlighted border border-default/30 shadow"
  >
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <component
          :is="colorMode === 'dark' ? Moon : Sun"
          class="size-5"
        />
        <div class="text-sm">
          {{ output?.message || "Switch theme?" }}
        </div>
      </div>
      <div class="flex items-center gap-2">
        <label for="theme-toggle" class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" id="theme-toggle" class="sr-only peer" v-model="isDark" aria-label="Toggle dark mode">
          <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>
  </div>

  <div
    v-else-if="state === 'output-error'"
    class="w-[480px] rounded-xl px-5 py-4 bg-error/10 text-error border border-error/30 shadow"
  >
    <div class="text-sm">Unable to change theme</div>
  </div>
</template>
