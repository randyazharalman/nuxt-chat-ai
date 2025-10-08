/* eslint-disable */
<script setup lang="ts">
import { computed, ref } from "vue";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNuxtApp } from "#app"; 

interface Props {
  status?: "ready" | "streaming" | "error" | "submitted";
  error?: Error;
  disabled?: boolean;
  onStop?: () => void;
  onReload?: () => void;
}

interface Attachment {
  name: string;
  type: string;
  category: "image" | "audio" | "pdf";
  url: string; 
  size: number;
  path: string; 
}

const props = withDefaults(defineProps<Props>(), {
  status: "ready",
  disabled: false,
});

const emit = defineEmits<{
  submit: [event: Event, attachments: Attachment[]];
}>();

const input = defineModel<string>({ required: true });
const fileInputRef = ref<HTMLInputElement>();
const attachments = ref<Attachment[]>([]);
const isUploading = ref(false);

const promptClasses = computed(() => {
  return "[view-transition-name:chat-prompt]";
});

const computedStatus = computed(() => {
  return props.status;
});

const canSubmit = computed(() => {
  return (
    !props.disabled &&
    !isUploading.value &&
    computedStatus.value !== "streaming" &&
    (input.value.trim().length > 0 || attachments.value.length > 0)
  );
});

const isInputDisabled = computed(() => {
  return (
    props.disabled || computedStatus.value === "streaming" || isUploading.value
  );
});

function handleSubmit(event: Event) {
  event.preventDefault();

  if (!canSubmit.value) {
    return;
  }

  emit("submit", event, attachments.value);

  attachments.value = [];

}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    if (canSubmit.value) {
      handleSubmit(event);
    }
  }
}

function triggerFileUpload() {
  fileInputRef.value?.click();
}

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (!files || files.length === 0) return;

  isUploading.value = true;
  const { $supabase } = useNuxtApp(); 

  try {
    for (const file of Array.from(files)) {
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Max size is 10MB.`);
        continue;
      }

      const filePath = `ai-uploads/${Date.now()}-${file.name}`;

      const { data, error } = await $supabase.storage
        .from("chat-files") 
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Error uploading file:", file.name, error.message);
        alert(`Error uploading ${file.name}: ${error.message}`);
        continue;
      }

      const { data: publicUrlData } = $supabase.storage
        .from("chat-files")
        .getPublicUrl(filePath); 

      if (publicUrlData) {
        const fileCategory = file.type.startsWith("image/")
          ? "image"
          : file.type.startsWith("audio/")
          ? "audio"
          : file.type === "application/pdf"
          ? "pdf"
          : "file"; 

        attachments.value.push({
          name: file.name,
          type: file.type,
          category: fileCategory as "image" | "audio" | "pdf", 
          url: publicUrlData.publicUrl,
          size: file.size,
          path: filePath,
        });
      } else {
        console.error("Could not get public URL for file:", file.name);
        alert(`Could not get public URL for ${file.name}`);
      }
    }
  } catch (error: any) {
    console.error("Upload error:", error.message);
    alert("Failed to upload file. Please try again.");
  } finally {
    isUploading.value = false;
    // Reset input
    if (target) target.value = "";
  }
}

function removeAttachment(index: number) {
  attachments.value.splice(index, 1);
}

function getFileIcon(category: string) {
  switch (category) {
    case "image":
      return "lucide:image";
    case "audio":
      return "lucide:audio-lines";
    case "pdf":
      return "lucide:file-text";
    default:
      return "lucide:file";
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
</script>

<template>
  <div :class="promptClasses" class="rounded-xl bg-gray-100 dark:bg-gray-900 p-2">
    <div class="flex flex-col gap-2 rounded-xl bg-white dark:bg-gray-800 p-3">
      <!-- Attachments Preview -->
      <div
        v-if="attachments.length > 0"
        class="flex flex-wrap gap-2 pb-2 border-b border-gray-200 dark:border-gray-700"
      >
        <div
          v-for="(attachment, index) in attachments"
          :key="index"
          class="relative group flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
        >
          <!-- Image Preview -->
          <img
            v-if="attachment.category === 'image'"
            :src="attachment.url"
            :alt="attachment.name"
            class="w-12 h-12 object-cover rounded"
          />
          <!-- File Icon for non-images -->
          <Icon
            v-else
            :name="getFileIcon(attachment.category)"
            class="w-8 h-8 text-gray-600 dark:text-gray-300"
          />

          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate text-gray-800 dark:text-gray-100">{{ attachment.name }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ formatFileSize(attachment.size) }}
            </p>
          </div>

          <!-- Remove Button -->
          <Button
            variant="ghost"
            size="icon"
            class="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            @click="removeAttachment(index)"
          >
            <Icon name="lucide:x" class="h-4 w-4" />
          </Button>
        </div>
      </div>

      <form @submit="handleSubmit">
        <Textarea
          v-model="input"
          :disabled="isInputDisabled"
          placeholder="Type your message here"
          class="min-h-[60px] resize-none border-0 focus-visible:ring-0 p-2 bg-transparent text-gray-900 dark:text-gray-50"
          @keydown="handleKeyDown"
        />
      </form>

      <div class="flex flex-row items-center justify-between">
        <div class="flex items-center gap-2">
          <!-- File Upload Button -->
          <Button
            variant="ghost"
            size="icon"
            :disabled="isInputDisabled"
            @click="triggerFileUpload"
            class="relative text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Icon
              v-if="isUploading"
              name="lucide:loader-2"
              class="h-5 w-5 animate-spin"
            />
            <Icon
              v-else
              name="lucide:paperclip"
              class="h-5 w-5"
            />
          </Button>
          <ModelSwitcher />

          <!-- Hidden File Input -->
          <input
            ref="fileInputRef"
            type="file"
            class="hidden"
            accept="image/*,audio/*,.pdf"
            multiple
            @change="handleFileChange"
          />
        </div>

        <div class="flex gap-2">
          <!-- Stop Button -->
          <Button
            v-if="computedStatus === 'streaming' && onStop"
            variant="outline"
            size="sm"
            @click="onStop"
            class="dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
          >
            <Icon name="lucide:square" class="h-4 w-4 mr-2" />
            Stop
          </Button>

          <!-- Reload Button -->
          <Button
            v-else-if="computedStatus === 'error' && onReload"
            variant="outline"
            size="sm"
            @click="onReload"
            class="dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
          >
            <Icon name="lucide:refresh-cw" class="h-4 w-4 mr-2" />
            Reload
          </Button>

          <!-- Submit Button -->
          <Button
            :disabled="!canSubmit"
            size="icon"
            type="submit"
            @click="handleSubmit"
            class="p-1 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
          >
            <Icon
              v-if="computedStatus === 'streaming'"
              name="lucide:loader-2"
              class="h-5 w-5 animate-spin"
            />
            <Icon
              v-if="computedStatus === 'submitted'"
              name="lucide:loader-2"
              class="h-5 w-5 animate-spin"
            />
            <Icon
              v-else-if="computedStatus === 'error'"
              name="lucide:alert-triangle"
              class="h-5 w-5 text-red-500"
            />
            <Icon v-else name="lucide:send" class="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.textarea {
  transition: opacity 0.2s ease;
}

.textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
