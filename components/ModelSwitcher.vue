<script setup lang="ts">
import { Brain } from "lucide-vue-next";
const { model, models } = useLLM();

const selectedModelValue = computed({
  get: () => model.value?.value || "",
  set: (value: string) => {
    console.log("ModelSwitcher: Setting model to", value);
    model.value = models.find((m) => m.value === value)!;
    console.log("ModelSwitcher: New model.value is", model.value);
  },
});
</script>

<template>
  <div class="flex items-center gap-2">
    <!-- Ikon AI -->
    <Brain class="w-4 h-4 text-gray-400" />

    <Select v-model="selectedModelValue">
      <SelectTrigger
        class="border-none bg-transparent px-2 py-1 focus:ring-0 focus:outline-none shadow-none text-sm font-medium flex items-center gap-2"
      >
        <SelectValue placeholder="Select model" class="text-muted-foreground" />
        <!-- <ChevronDown class="w-4 h-4 opacity-60" /> -->
      </SelectTrigger>

      <SelectContent class="rounded-lg shadow-md">
        <SelectGroup>
          <SelectLabel class="text-xs text-muted-foreground px-2 py-1"
            >Available Models</SelectLabel
          >
          <SelectItem
            v-for="item in models"
            :key="item.value"
            :value="item.value"
            class="text-sm cursor-pointer hover:bg-muted transition-colors"
          >
            {{ item.label }}
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>
</template>

<style scoped>
:deep(.select-trigger) {
  border: none !important;
  box-shadow: none !important;
}
</style>
