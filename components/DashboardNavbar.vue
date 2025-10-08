<script setup lang="ts">
import { useLogtoUser } from "#imports"; // Add this line if auto-import is disabled
const user = useLogtoUser();
</script>

<template>
  <div
    class="sticky flex items-center p-4 z-20 lg:absolute top-0 w-full justify-end border-b"
  >
    <a :href="user ? '/logout' : '/login'" class="flex items-end gap-0.5">
      <Logo class="h-7 w-auto shrink-0" />
      <span class="hidden sm:block text-lg font-bold text-highlighted">{{
        user ? "Logout" : "Login"
      }}</span>
    </a>
    <span
      aria-hidden="true"
      class="ml-2 text-muted w-4 min-w-4 select-none text-center text-lg"
      >/</span
    >
    <span
      aria-hidden="true"
      class="text-muted w-4 min-w-4 select-none text-center text-lg"
      >/</span
    >
    <CommandPalette />
    <span
      aria-hidden="true"
      class="text-muted w-4 min-w-4 select-none text-center text-lg"
      >/</span
    >
    <UTooltip text="New Chat">
      <Button
        color="neutral"
        variant="ghost"
        icon="i-lucide-plus"
        size="sm"
        to="/"
      />
    </UTooltip>
  </div>
</template>
