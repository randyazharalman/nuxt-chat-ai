<script setup lang="ts">
import { marked } from "marked";
import { codeToHtml } from "shiki";
import { computed, ref, watch, onUnmounted } from "vue";
import Weather from "~/components/tool/Weather.vue";
import Theme from "~/components/tool/Theme.vue";
import Summarize from "~/components/tool/Summarize.vue"; 

interface ToolOutput {
  _toolName: string;
  state: string;
  output: any;
}

interface Props {
  content: string;
  role: "user" | "assistant" | "system";
  isLastMessage: boolean;
  isStreaming: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits(["typing-scroll"]);

const displayedContent = ref("");
const html = ref("");
const toolData = ref<ToolOutput | null>(null);
let typingTimeout: NodeJS.Timeout | null = null;


const toolComponents: Record<string, any> = {
  weather: Weather,
  theme: Theme,
  summarize: Summarize,
};


marked.setOptions({
  gfm: true,
  breaks: true,
});

async function highlightCode(code: string, lang?: string) {
  try {
    return await codeToHtml(code, {
      lang: lang || "text",
      theme: document.documentElement.classList.contains("dark")
        ? "github-dark-default"
        : "github-light-default",
    });
  } catch (e) {
    console.warn("Shiki failed to highlight code:", e);
    return `<pre><code>${code}</code></pre>`;
  }
}

async function parseMarkdown(content: string) {
  const tokens = marked.lexer(content);

  for (const token of tokens) {
    if (token.type === "code") {
      token.text = await highlightCode(token.text, token.lang);
      token.type = "html"; 
    }
  }

  return marked.parser(tokens);
}

// Stop any ongoing typing animation
function stopTyping() {
  if (typingTimeout) {
    clearTimeout(typingTimeout);
    typingTimeout = null;
  }
}


watch(
  () => props.content,
  async (newContent) => {
    stopTyping(); 
    toolData.value = null; 


    try {
      const parsed = JSON.parse(newContent);
      if (
        parsed &&
        typeof parsed === "object" &&
        parsed._toolName &&
        parsed.state
      ) {
        toolData.value = parsed as ToolOutput;

        displayedContent.value = "";
        html.value = "";
        return;
      }
    } catch (e) {

    }

    if (props.role === "user" || !props.isLastMessage || !props.isStreaming) {

      displayedContent.value = newContent;
      try {
        html.value = await parseMarkdown(newContent);
      } catch (err) {
        console.error("Markdown parse error:", err);
        html.value = newContent;
      }
    } else {

      displayedContent.value = ""; 
      let i = 0;
      const typeCharacter = async () => {
        if (i < newContent.length) {
          displayedContent.value += newContent[i];
          emit("typing-scroll");
          try {
            html.value = await parseMarkdown(displayedContent.value);
          } catch (err) {
            console.error("Markdown parse error during typing:", err);
            html.value = displayedContent.value;
          }
          i++;
          typingTimeout = setTimeout(typeCharacter, 2); 
        } else {
          // Ensure final content is parsed and displayed
          try {
            html.value = await parseMarkdown(newContent);
          } catch (err) {
            console.error("Markdown parse error on finish typing:", err);
            html.value = newContent;
          }
        }
      };
      typeCharacter();
    }
  },
  { immediate: true } 
);


watch(displayedContent, async (newDisplayedContent) => {
  if (props.role === "assistant" && !toolData.value) {
    // Only parse markdown if not a tool output
    try {
      html.value = await parseMarkdown(newDisplayedContent);
    } catch (err) {
      console.error("Markdown parse error:", err);
      html.value = newDisplayedContent;
    }
  }
});

// Cleanup on component unmount
onUnmounted(() => {
  stopTyping();
});
</script>

<template>
  <div
    v-if="role === 'user'"
    class="text-sm leading-relaxed whitespace-pre-wrap break-words"
  >
    {{ content }}
  </div>

  <div v-else>
    <div v-if="toolData && toolComponents[toolData._toolName]">
      <component
        :is="toolComponents[toolData._toolName]"
        :state="toolData.state"
        :output="toolData.output"
      />
    </div>
    <div
      v-else
      class="markdown prose prose-sm dark:prose-invert max-w-none prose-pre:bg-muted prose-pre:text-foreground prose-p:leading-relaxed prose-headings:font-semibold prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-[''] prose-code:after:content-[''] break-words"
      v-html="html"
    />
  </div>
</template>

<style lang="postcss">
.markdown pre {
  @apply rounded-lg p-4 overflow-x-auto my-4 border border-border break-words; /* Added break-words for pre */
}

.markdown code {
  @apply text-sm px-5 font-mono; /* Added font-mono */
}

.markdown p {
  @apply my-2 leading-relaxed; /* Ensure consistent paragraph spacing and line height */
}

.markdown ul,
.markdown ol {
  @apply my-2 ml-4;
}

.markdown li {
  @apply my-1;
}

.markdown blockquote {
  @apply border-l-4 border-primary pl-4 italic my-4;
}

.markdown table {
  @apply w-full border-collapse my-4;
}

.markdown th,
.markdown td {
  @apply border border-border px-4 py-2;
}

.markdown th {
  @apply bg-muted font-semibold;
}

.markdown a {
  @apply text-primary hover:underline;
}

.markdown hr {
  @apply my-4 border-border;
}

.markdown img {
  @apply rounded-lg my-4 max-w-full h-auto;
}
</style>
