<script setup lang="ts">
import { computed, ref, onMounted, watch } from "vue";
import { DefaultChatTransport } from "ai";
import { Chat } from "@ai-sdk/vue";
import { SidebarProvider } from "~/components/ui/sidebar";
import Sidebar from "~/components/Sidebar.vue";
import ChatLayout from "~/components/ChatLayout.vue";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

definePageMeta({
  middleware: ["auth"],
});

const {
  conversations,
  loadConversations,
  isLoading,
  refreshConversations, 
} = useConversation();

const { user, checkAuth } = useAuth();
const route = useRoute();


const showEditTitleDialog = ref(false);
const editingConversationId = ref<string | null>(null);
const editingConversationTitle = ref("");

const showDeleteConversationDialog = ref(false);
const deletingConversationId = ref<string | null>(null);

onMounted(async () => {
  try {
    await loadConversations();
    await checkAuth(); 
  } catch (error) {
    console.error("Failed to initialize chat:", error);
  }

  const unsavedInput = localStorage.getItem("unsavedChatInput");
  if (unsavedInput) {
    input.value = unsavedInput;
    localStorage.removeItem("unsavedChatInput");
  }
});

console.log("User before onMounted:", user.value);
const { model } = useLLM();
const input = ref("");
const isThinking = ref(false);
const pendingAttachments = ref<any[]>([]);

const { data } = await useFetch(`/api/chats/${route.params.id}`, {
  cache: "force-cache",
});

if (!data.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Chat not found",
    fatal: true,
  });
}

const chat = new Chat({
  id: data.value.id,
  messages: data.value.messages,
  transport: new DefaultChatTransport({
    api: `/api/chats/${route.params.id}`,
    body: {
      model: model.value?.value || "google/gemini-2.5-flash", 
      attachments: pendingAttachments.value, 
    },
  }),
  onFinish() {
    refreshNuxtData("chats");
    pendingAttachments.value = []; 

  },
  onError: (error) => {
    console.log(error);
  },
});

watch(
  () => chat.messages.length,
  (newLength, oldLength) => {
    if (
      newLength > oldLength &&
      chat.messages[newLength - 1]?.role === "assistant"
    ) {
      isThinking.value = false;
    }
  },
  { deep: true }
);

const chatPromptStatus = computed(() => {
  if (isThinking.value) return "submitted";
  if (chat.status === "streaming") return "streaming";
  return "ready";
});

const onSubmit = (event: Event, attachments: any[]) => {
  console.log("chat/[id].vue: onSubmit received attachments:", attachments); 
  if (!input.value.trim() && attachments.length === 0) {
    console.log("chat/[id].vue: onSubmit: No input or attachments, returning.");
    return;
  }
  if (isThinking.value || chat.status === "streaming") {
    console.log(
      "chat/[id].vue: onSubmit: Already thinking or streaming, returning."
    );
    return;
  }


  pendingAttachments.value = attachments;


  (chat as any).transport = new DefaultChatTransport({

    api: `/api/chats/${route.params.id}`,
    body: {
      model: model.value?.value || "google/gemini-2.5-pro", 
      attachments: attachments,
    },
  });
  console.log(
    "chat/[id].vue: Chat transport body updated with attachments:",
    (chat as any).transport.body.attachments
  ); // Debug log

  isThinking.value = true;
  chat.sendMessage({ text: input.value });

  input.value = "";

  console.log("Message sent with attachments:", attachments);
};

const handleNewChat = () => {
  navigateTo("/");
};
const handleLogout = () => {
  window.location.href = "/logout";
};


const handleEditConversationTitle = (id: string) => {
  const conversationToEdit = conversations.value.find((conv) => conv.id === id);
  if (conversationToEdit) {
    editingConversationId.value = id;
    editingConversationTitle.value = conversationToEdit.title;
    showEditTitleDialog.value = true;
  }
};

const handleUpdateTitle = async () => {
  if (!editingConversationId.value || !editingConversationTitle.value.trim()) {
    return;
  }
  try {
    await $fetch(`/api/conversations/${editingConversationId.value}`, {
      method: "PATCH",
      body: { title: editingConversationTitle.value },
    });
    await refreshConversations();
    showEditTitleDialog.value = false;
    editingConversationId.value = null;
    editingConversationTitle.value = "";
  } catch (error) {
    console.error("Failed to update conversation title:", error);
  }
};

const handleDeleteConversation = (id: string) => {
  deletingConversationId.value = id;
  showDeleteConversationDialog.value = true;
};

const handleConfirmDeleteConversation = async () => {
  if (!deletingConversationId.value) {
    return;
  }
  try {
    await $fetch(`/api/conversations/${deletingConversationId.value!}`, {
      // Add non-null assertion
      method: "DELETE",
    });
    await refreshConversations();
    showDeleteConversationDialog.value = false;
    deletingConversationId.value = null;

    if (route.params.id === deletingConversationId.value) {
      navigateTo("/");
    }
  } catch (error) {
    console.error("Failed to delete conversation:", error);

  }
};
</script>

<template>
  <SidebarProvider>
    <Sidebar
      :conversations="conversations"
      :current-conversation-id="
        Array.isArray(route.params.id)
          ? route.params.id[0] || ''
          : route.params.id || ''
      "
      :user="user"
      :is-loading="isLoading"
      @new-chat="handleNewChat"
      @select-conversation=""
      @delete-conversation="handleDeleteConversation"
      @edit-conversation-title="handleEditConversationTitle"
      @logout="handleLogout"
    />
    <ChatLayout
      :data="data"
      :chat="chat"
      :input="input"
      :is-thinking="isThinking"
      :user="user"
      :conversations="conversations"
      :current-conversation-id="
        Array.isArray(route.params.id)
          ? route.params.id[0] || ''
          : route.params.id || ''
      "
      :is-loading="isLoading"
      @update:input="input = $event"
      @submit="onSubmit"
      @new-chat="handleNewChat"
      @delete-conversation="handleDeleteConversation"
      @logout="handleLogout"
    />
  </SidebarProvider>

  <!-- Edit Title Dialog -->
  <Dialog v-model:open="showEditTitleDialog">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit Conversation Title</DialogTitle>
        <DialogDescription>
          Enter a new title for your conversation.
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <Input
          id="title"
          v-model="editingConversationTitle"
          class="col-span-3"
        />
      </div>
      <DialogFooter>
        <Button variant="outline" @click="showEditTitleDialog = false">
          Cancel
        </Button>
        <Button @click="handleUpdateTitle">Save changes</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Delete Conversation Dialog -->
  <Dialog v-model:open="showDeleteConversationDialog">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete Conversation</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this conversation? This action cannot
          be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" @click="showDeleteConversationDialog = false">
          Cancel
        </Button>
        <Button variant="destructive" @click="handleConfirmDeleteConversation">
          Delete
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
