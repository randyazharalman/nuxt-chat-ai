<template>
  <div>
    <input type="file" multiple @change="handleFileChange" />
    <div v-if="selectedFiles.length">
      <h3>Selected Files:</h3>
      <ul>
        <li v-for="(file, index) in selectedFiles" :key="index">
          {{ file.name }} ({{ (file.size / 1024 / 1024).toFixed(2) }} MB)
          <span v-if="uploadProgress[file.name] !== undefined">
            - {{ uploadProgress[file.name] }}%
          </span>
          <span v-if="uploadedFileUrls[file.name]">
            - Uploaded:
            <a :href="uploadedFileUrls[file.name]" target="_blank">View</a>
          </span>
        </li>
      </ul>
      <button @click="uploadFiles" :disabled="isUploading">
        {{ isUploading ? "Uploading..." : "Upload Files" }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useNuxtApp } from "#app";

const { $supabase } = useNuxtApp();

const selectedFiles = ref<File[]>([]);
const isUploading = ref(false);
const uploadProgress = ref<{ [key: string]: number }>({});
const uploadedFileUrls = ref<{ [key: string]: string }>({});

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files) {
    selectedFiles.value = Array.from(input.files);
    uploadProgress.value = {};
    uploadedFileUrls.value = {};
  }
};

const uploadFiles = async () => {
  if (!selectedFiles.value.length) return;

  isUploading.value = true;
  for (const file of selectedFiles.value) {
    const filePath = `public/${Date.now()}-${file.name}`;

    try {
      const { data, error } = await $supabase.storage
        .from("ai-uploads")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          onUploadProgress: (event) => {
            if (event.total) {
              uploadProgress.value[file.name] = Math.round(
                (event.loaded / event.total) * 100
              );
            }
          },
        });

      if (error) {
        console.error("Error uploading file:", file.name, error.message);
        alert(`Error uploading ${file.name}: ${error.message}`);
      } else {
        console.log("File uploaded successfully:", data);
        const { data: publicUrlData } = $supabase.storage
          .from("ai-uploads")
          .getPublicUrl(filePath);
        if (publicUrlData) {
          uploadedFileUrls.value[file.name] = publicUrlData.publicUrl;
        }
      }
    } catch (err: any) {
      console.error("Unexpected error during upload:", err.message);
      alert(`Unexpected error uploading ${file.name}: ${err.message}`);
    }
  }
  isUploading.value = false;
};
</script>

<style scoped>
div {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #f9f9f9;
}

h3 {
  margin-top: 0;
  color: #333;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  padding: 5px 0;
  border-bottom: 1px dashed #eee;
}

li:last-child {
  border-bottom: none;
}

button {
  background-color: #007bff;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>
