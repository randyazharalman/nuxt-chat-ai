<script setup lang="ts">
import TextGradient from "~/components/TextGradient.vue";
import { Button } from "~/components/ui/button";
import { useLLM } from "~/composables/useLLM";
import type { UIMessage } from "ai";

interface CreateChatResponse {
  success: boolean;
  conversationId: string;
  messages: UIMessage[];
}

const user = useLogtoUser();
const input = ref("");
const loading = ref(false);
const attachments = ref<any[]>([]);
const { model } = useLLM();

async function createChat(prompt: string, currentAttachments: any[] = []) {
  input.value = prompt;
  loading.value = true;
  console.log(
    "createChat input:",
    input.value,
    "attachments:",
    currentAttachments
  );

  try {
    const chat = await $fetch<CreateChatResponse>("/api/chats", {
      method: "POST",
      body: {
        input: input.value,
        model: model.value?.value,
        attachments: currentAttachments,
      },
    });

    if (!chat || !chat.conversationId) {
      loading.value = false;
      return;
    }

    refreshNuxtData("chats");
    navigateTo(`/chat/${chat.conversationId}`);
  } catch (error) {
    console.error("Failed to create chat:", error);
    loading.value = false;
  }
}

function onSubmit(event: Event, currentAttachments: any[] = []) {
  console.log("index.vue: onSubmit received attachments:", currentAttachments);
  if (
    (!input.value.trim() && currentAttachments.length === 0) ||
    loading.value
  ) {
    console.log(
      "index.vue: onSubmit: No input or attachments, or loading, returning."
    );
    return;
  }
  loading.value = true;
  attachments.value = currentAttachments;
  createChat(input.value, attachments.value);
  console.log(
    "index.vue: Message submitted with input:",
    input.value,
    "attachments:",
    attachments.value
  );
}

function selectPrompt(prompt: string) {
  input.value = prompt;
  onSubmit(new Event("submit"));
}

const quickChats = [
  {
    label: "Check Weather",
    icon: "i-lucide-sun",
  },
  {
    label: "Why use Nuxt",
    icon: "i-logos-nuxt-icon",
  },
  {
    label: "Summarize Text",
    icon: "i-lucide-map-pin",
  },
  {
    label: "Change Theme of app",
    icon: "i-lucide-sun",
  },
];
</script>

<template>
  <div class="relative flex-1 flex flex-col min-w-0 min-h-svh">
    <DashboardNavbar />
    <div
      class="flex-1 flex flex-col justify-center items-center gap-8 py-12 px-4"
    >
      <!-- Header -->
      <div class="flex flex-col gap-2 text-center">
        <span
          class="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight"
        >
          <TextGradient text="Welcome!" />
        </span>
        <span
          class="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 font-light"
        >
          How can I assist you today?
        </span>
      </div>

      <!-- Tools Section -->
      <div class="flex flex-wrap gap-2">
        <Button
          v-for="quickChat in quickChats"
          :key="quickChat.label"
          :icon="quickChat.icon"
          :label="quickChat.label"
          size="sm"
          color="neutral"
          variant="outline"
          class="relative group/shimmer rounded-full"
          :ui="{
            leadingIcon: 'grayscale',
          }"
          @click="createChat(quickChat.label)"
        >
          <span class="relative z-10 transition-colors duration-300">
            {{ quickChat.label }}
            <span
              class="absolute inset-0 bg-clip-text bg-inverted text-transparent opacity-0 group-hover/shimmer:opacity-100 group-hover/shimmer:animate-shimmer-once transition-opacity duration-200"
              style="
                background-image: linear-gradient(
                  90deg,
                  transparent calc(50% - 40px),
                  #12a594,
                  #e93d82,
                  #ffb224,
                  transparent calc(50% + 40px)
                );
                background-size: 200% 100%;
                background-position: -50% center;
              "
            >
              {{ quickChat.label }}
            </span>
          </span>
        </Button>
      </div>

      <!-- Chat Prompt -->
      <div class="w-full max-w-3xl mt-8">
        <ChatPrompt
          v-model="input"
          :status="loading ? 'streaming' : 'ready'"
          :disabled="loading"
          @submit="onSubmit"
        />
      </div>
    </div>
  </div>
</template>
