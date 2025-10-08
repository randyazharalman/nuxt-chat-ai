<script setup lang="ts">
import { computed, ref, onMounted, nextTick, watch } from "vue";
import type { UIMessage } from "ai";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import MarkdownMessage from "~/components/MarkdownMessage.vue";
import TextGradient from "~/components/TextGradient.vue";
import {
  useSidebar,
  SIDEBAR_WIDTH,
  SIDEBAR_WIDTH_ICON,
} from "~/components/ui/sidebar/utils";
import type { WeatherToolUIPart } from "~/utils/tools/weather";
import type { ThemeToolUIPart } from "~/utils/tools/theme";
import type { SummarizeToolUIPart } from "~/utils/tools/summarize";

const props = defineProps<{
  data: any; 
  chat: any; 
  input: string;
  isThinking: boolean;
  user: any; 
  conversations: any[]; 
  currentConversationId: string | null;
  isLoading: boolean;
}>();

const emit = defineEmits([
  "update:input",
  "submit",
  "new-chat",
  "delete-conversation",
  "logout",
  "typing-scroll",
]);

const input = computed({
  get: () => props.input,
  set: (value) => emit("update:input", value),
});

const { open, isMobile } = useSidebar();

const chatAreaLeft = computed(() => {
  if (isMobile.value) {
    return "0rem";
  }
  return open.value ? SIDEBAR_WIDTH : SIDEBAR_WIDTH_ICON;
});

const messagesEndRef = ref<HTMLElement>();
const messagesContainerRef = ref<HTMLElement>();
const showScrollToBottom = ref(false);

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainerRef.value) {
      messagesContainerRef.value.scrollTo({
        top: messagesContainerRef.value.scrollHeight,
        behavior: "smooth",
      });
    }
  });
}

const handleTypingScroll = () => {
  scrollToBottom();
};

function handleScroll() {
  if (messagesContainerRef.value) {
    const { scrollTop, scrollHeight, clientHeight } =
      messagesContainerRef.value;
    const threshold = 100; 
    showScrollToBottom.value =
      scrollHeight - scrollTop - clientHeight > threshold;
  }
}

onMounted(() => {
  if (messagesContainerRef.value) {
    messagesContainerRef.value.addEventListener("scroll", handleScroll);
  }
});


watch(
  () => props.chat.messages,
  (newMessages) => {
    if (newMessages && newMessages.length > 0) {
      nextTick(() => {
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      });
    }
  },
  { deep: true, immediate: true } 
);

onBeforeUnmount(() => {
  if (messagesContainerRef.value) {
    messagesContainerRef.value.removeEventListener("scroll", handleScroll);
  }
});

const getMessageText = (message: UIMessage): string => {
  const parts = message.parts;
  if (!parts) {
    return typeof (message as any).content === "string"
      ? (message as any).content
      : "";
  }
  const arr = Array.isArray(parts) ? parts : [parts];
  const texts = arr
    .filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
    .map((p) => p.text);
  return texts.join("\n");
};
</script>

<template>
  <SidebarInset class="flex flex-col h-screen overflow-hidden">
    <!-- Fixed Header -->
    <header
      class="fixed top-0 right-0 z-20 flex h-14 shrink-0 items-center gap-2 px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200 ease-linear"
      :style="{ left: chatAreaLeft }"
    >
      <SidebarTrigger class="-ml-1" />
      <div class="flex-1">
        <h1 class="text-md truncate">
          {{ props.data?.title || "New Chat" }}
        </h1>
      </div>
    </header>

    <!-- Messages Area -->
    <div
      ref="messagesContainerRef"
      class="flex-1 overflow-y-auto pt-16 pb-[140px] relative"
    >
      <div class="mx-auto max-w-4xl space-y-6 py-6 px-4">
        <!-- Empty State -->
        <div
          v-if="props.chat.messages.length === 0"
          class="flex flex-col items-center justify-center min-h-[60vh] gap-4"
        >
          <div class="rounded-full bg-primary/10 p-6">
            <Icon name="lucide:sparkles" class="h-12 w-12 text-primary" />
          </div>
          <div class="text-center space-y-2">
            <h3 class="text-2xl font-semibold">Start a conversation</h3>
            <p class="text-muted-foreground">
              Ask me anything, I'm here to help!
            </p>
          </div>
        </div>

        <!-- Messages -->
        <div
          v-for="(message, index) in props.chat.messages"
          :key="message.id"
          class="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
          :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <!-- Assistant Avatar -->
          <Avatar v-if="message.role === 'assistant'" class="shrink-0">
            <AvatarFallback>
              <Icon name="lucide:sparkles" class="h-30 w-30 text-gray-400" />
            </AvatarFallback>
          </Avatar>

          <!-- Message Content -->
          <div
            class="max-w-[85%] space-y-3 rounded-2xl px-5 py-4"
            :class="message.role === 'user' ? 'bg-muted font-medium' : ''"
          >
            <MarkdownMessage
              :content="getMessageText(message)"
              :role="message.role"
              :is-last-message="index === props.chat.messages.length - 1"
              :is-streaming="props.chat.status === 'streaming'"
              @typing-scroll="handleTypingScroll"
            />
            <template
              v-for="(part, index) in message.parts"
              :key="`${part.type}-${index}-${message.id}`"
            >
              <ToolWeather
                v-if="part.type === 'tool-weather'"
                :state="part.state as WeatherToolUIPart['state']"
                :output="part.output as WeatherToolUIPart['output']"
              />
              <ToolTheme
                v-if="part.type === 'tool-theme'"
                :state="part.state as ThemeToolUIPart['state']"
                :output="part.output as ThemeToolUIPart['output']"
              />
              <ToolSummarize
                v-if="part.type === 'tool-summarize'"
                :state="part.state as SummarizeToolUIPart['state']"
                :output="part.output as SummarizeToolUIPart['output']"
              />
              
            </template>
          </div>

          <!-- User Avatar -->
          <Avatar v-if="message.role === 'user'" class="shrink-0">
            <AvatarFallback class="">
              <Icon name="lucide:user" class="h-4 w-4 text-gray-400" />
            </AvatarFallback>
          </Avatar>
        </div>

        <!-- Thinking Indicator -->
        <div
          v-if="props.isThinking"
          class="flex animate-in fade-in duration-300"
        >
          <Avatar class="h-8 w-8 shrink-0">
            <AvatarFallback>
              <Icon name="lucide:sparkles" class="h-30 w-30 text-gray-400" />
            </AvatarFallback>
          </Avatar>
          <div class="flex items-center gap-3 rounded-2xl px-5 py-4">
            <TextGradient text="Thinking.." />
          </div>
        </div>

        <!-- Scroll Anchor -->
        <div ref="messagesEndRef" class="h-1"></div>
      </div>
    </div>

    <!-- Fixed Prompt Input at Bottom -->
    <div
      class="fixed bottom-0 right-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200 ease-linear"
      :style="{ left: chatAreaLeft }"
    >
      <div class="mx-auto max-w-4xl p-4 relative">
        <!-- Added relative here -->
        <ChatPrompt
          v-model="input"
          :status="
            props.isThinking
              ? 'submitted'
              : props.chat.status === 'streaming'
              ? 'streaming'
              : 'ready'
          "
          :disabled="props.isThinking || props.chat.status === 'streaming'"
          @submit="(event, attachments) => emit('submit', event, attachments)"
        />
        <p class="text-xs text-center text-muted-foreground mt-2">
          AI can make mistakes. Consider checking important information.
        </p>

        <!-- Scroll to Bottom Indicator -->
        <Transition
          enter-active-class="transition-opacity duration-300"
          leave-active-class="transition-opacity duration-300"
          enter-from-class="opacity-0"
          leave-to-class="opacity-0"
        >
          <Button
            v-if="showScrollToBottom"
            class="absolute -top-16 left-1/2 -translate-x-1/2 rounded-full p-2 shadow-lg z-30"
            variant="secondary"
            size="icon"
            @click="scrollToBottom"
          >
            <Icon name="lucide:arrow-down" class="h-5 w-5" />
          </Button>
        </Transition>
      </div>
    </div>
  </SidebarInset>
</template>
