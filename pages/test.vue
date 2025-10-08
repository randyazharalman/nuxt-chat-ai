<template>
  <div class="flex flex-col min-h-screen">
     Top nav 
    <header class="border-b border-zinc-200/70 dark:border-zinc-800">
      <div class="mx-auto max-w-7xl px-4 md:px-6 h-14 flex items-center gap-3">
        <button
          class="md:hidden -ml-1 inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900"
          @click="mobileOpen = true"
          aria-label="Open sidebar"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-width="2" d="M3 6h18M3 12h18M3 18h18"/></svg>
        </button>
        <div class="flex items-center gap-2 font-semibold">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-width="2" d="M3 12l6-9 6 9-6 9-6-9z"/></svg>
          <span>Chat</span>
        </div>
        <span class="text-zinc-400">/</span>
        <button class="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5l-3.5 6h7L12 .5zM8.5 8l-6 10.5h18L14.5 8h-6z"/></svg>
          Login with GitHub
        </button>
        <span class="text-zinc-400">/</span>
        <button class="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          Browse Chats
        </button>
        <span class="text-zinc-400">/</span>
        <button class="inline-flex items-center justify-center text-sm h-7 w-7 rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900" @click="newChat" aria-label="New chat">+</button>
      </div>
    </header>

    <div class="mx-auto max-w-7xl w-full flex-1 grid grid-cols-1 md:grid-cols-[280px,1fr]">
       Desktop sidebar 
      <aside class="hidden md:block border-r border-zinc-200/70 dark:border-zinc-800">
        <ChatSidebar
          :conversations="conversations"
          :active-id="activeId"
          @select="selectConversation"
          @new="newChat"
          @delete="deleteConversation"
          @rename="renameConversation"
        />
      </aside>

       Main 
      <section class="relative min-h-[calc(100vh-56px)]">
         Welcome or Conversation 
        <div v-if="!activeMessages.length" class="h-full flex items-center justify-center">
          <div class="max-w-xl w-full px-6 py-10">
            <h2 class="text-2xl font-semibold mb-2">Welcome</h2>
            <h3 class="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-800/90 dark:text-zinc-100/90 leading-tight mb-4">
              How can I help you today?
            </h3>

            <div class="flex flex-wrap gap-2 mb-6">
              <button
                v-for="(s, i) in suggestions"
                :key="i"
                @click="prefillAndFocus(s)"
                class="inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <svg class="h-4 w-4 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="4" stroke-width="2"/><path stroke-width="2" d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
                {{ s }}
              </button>
            </div>

            <div class="mt-4">
              <ChatInput
                :model="model"
                v-model="draft"
                :sending="sending"
                @send="handleSend"
              />
            </div>
          </div>
        </div>

        <div v-else class="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-10">
           Reasoning tag 
          <div class="mb-6 flex items-center gap-2 text-sm text-zinc-500">
            <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-zinc-200 dark:border-zinc-800">
              <svg viewBox="0 0 24 24" class="h-4 w-4"><path fill="currentColor" d="M12 2 1 21h22L12 2Zm0 4.84L19.53 19H4.47L12 6.84Z"/></svg>
              Reasoning
            </span>
            <span class="text-zinc-400">▼</span>
          </div>

           Messages 
          <div class="space-y-6" ref="listEl">
            <div
              v-for="(m,i) in activeMessages"
              :key="i"
              class="flex gap-3"
              :class="m.role === 'user' ? 'justify-end' : 'justify-start'"
            >
               Assistant avatar 
              <div
                v-if="m.role === 'assistant'"
                class="h-8 w-8 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0"
                aria-hidden="true"
              >
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-width="2" d="M12 3l9 4-9 4-9-4 9-4zm0 8l9 4-9 4-9-4 9-4z"/></svg>
              </div>

              <MessageBubble
                :role="m.role"
                :content="m.content"
              />

               User avatar 
              <div
                v-if="m.role === 'user'"
                class="h-8 w-8 rounded-full bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 flex items-center justify-center shrink-0"
                aria-hidden="true"
              >
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.42 0-8 2-8 4.5V21h16v-2.5c0-2.5-3.58-4.5-8-4.5Z"/></svg>
              </div>
            </div>
          </div>

           Composer fixed to bottom spacing 
          <div class="h-28"></div>

           Bottom composer 
          <div class="fixed left-0 right-0 bottom-0 border-t border-zinc-200/70 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-zinc-950/60">
            <div class="mx-auto max-w-2xl px-4 md:px-6 py-4">
              <ChatInput
                :model="model"
                v-model="draft"
                :sending="sending"
                @send="handleSend"
              />
            </div>
          </div>
        </div>
      </section>
    </div>

     Mobile sidebar sheet 
    <transition name="fade">
      <div
        v-if="mobileOpen"
        class="fixed inset-0 z-40"
        @click.self="mobileOpen = false"
      >
        <div class="absolute inset-0 bg-black/30"></div>
        <div class="absolute left-0 top-0 bottom-0 w-80 max-w-[85%] bg-white dark:bg-zinc-950 border-r border-zinc-200/70 dark:border-zinc-800 shadow-xl">
          <ChatSidebar
            :conversations="conversations"
            :active-id="activeId"
            @select="c => { selectConversation(c); mobileOpen = false }"
            @new="() => { newChat(); mobileOpen = false }"
            @delete="deleteConversation"
            @rename="renameConversation"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'


const mobileOpen = ref(false)
const model = ref('GPT-5 Nano')

const suggestions = [
  'What is the weather in London?',
  'Why use Nuxt UI Pro?',
  'What is the capital of France?',
  'How to change the theme of the app?',
]

const conversations = ref([
  { id: cryptoRandomId(), title: 'New Chat', messages: [] }
])
const activeId = ref(conversations.value[0].id)
const active = computed(() => conversations.value.find(c => c.id === activeId.value) || null)
const activeMessages = computed(() => active.value?.messages ?? [])

const draft = ref('')
const sending = ref(false)
const listEl = ref(null)

function prefillAndFocus(text) {
  draft.value = text
  scrollComposerIntoView()
}

function scrollComposerIntoView() {
  // Using the fixed composer, just ensure viewport is at bottom of messages.
  nextTick(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  })
}

function selectConversation(id) {
  activeId.value = id
}

function newChat() {
  const chat = { id: cryptoRandomId(), title: 'New Chat', messages: [] }
  conversations.value.unshift(chat)
  activeId.value = chat.id
}

function deleteConversation(id) {
  const idx = conversations.value.findIndex(c => c.id === id)
  if (idx !== -1) {
    conversations.value.splice(idx, 1)
    if (!conversations.value.length) {
      newChat()
    } else if (activeId.value === id) {
      activeId.value = conversations.value[0].id
    }
  }
}

function renameConversation({ id, title }) {
  const c = conversations.value.find(c => c.id === id)
  if (c) c.title = title || c.title
}

async function handleSend(text) {
  const trimmed = text.trim()
  if (!trimmed || sending.value) return
  if (!active.value) newChat()

  sending.value = true
  draft.value = ''
  active.value.messages.push({ role: 'user', content: trimmed })
  updateTitleFromFirstMessage(active.value)

  await nextTick()
  // Simulated assistant response
  setTimeout(async () => {
    const reply = `You said: "${trimmed}". How else can I help?`
    active.value?.messages.push({ role: 'assistant', content: reply })
    sending.value = false
    await nextTick()
    if (listEl.value) {
      listEl.value.scrollIntoView({ block: 'end' })
      window.scrollTo({ top: document.body.scrollHeight })
    }
  }, 600)
}

function updateTitleFromFirstMessage(conv) {
  if (!conv) return
  if (conv.title === 'New Chat' && conv.messages.length) {
    conv.title = conv.messages[0].content.slice(0, 40) + (conv.messages[0].content.length > 40 ? '…' : '')
  }
}

function cryptoRandomId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Math.random().toString(36).slice(2)
}

// Persist to localStorage
onMounted(() => {
  try {
    const raw = localStorage.getItem('nuxt-chat-ai-conversations')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length) {
        conversations.value = parsed
        activeId.value = parsed[0].id
      }
    }
  } catch {}
})

watch(conversations, (v) => {
  try {
    localStorage.setItem('nuxt-chat-ai-conversations', JSON.stringify(v))
  } catch {}
}, { deep: true })
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>