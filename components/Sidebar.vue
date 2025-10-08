<script setup lang="ts">
import type { Conversation } from "@prisma/client";
import { MessageCircle, MoreVertical } from "lucide-vue-next";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarFooter,
} from "./ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

const props = defineProps<{
  conversations: Conversation[];
  currentConversationId: string | null;
  user: any;
  isLoading: boolean;
}>();

const emit = defineEmits<{
  newChat: [];
  selectConversation: [id: string];
  logout: [];
  deleteConversation: [id: string];
  editConversationTitle: [id: string];
}>();
</script>

<template>
  <Sidebar
    class="bg-gray-50 text-gray-800 border-r border-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-800"
  >
    <SidebarHeader class="p-7 border-b border-gray-200 dark:border-gray-800">
      <SearchForm />
    </SidebarHeader>
    <SidebarContent class="flex-1 overflow-y-auto overflow-x-hidden p-2">
      <!-- New Chat Button -->
      <NuxtLink :to="'/'" class="block mb-4">
        <SidebarGroupLabel
          class="text-md p-5 bg-gray-10 mx-auto flex justify-center hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition-colors duration-200 text-left dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100"
        >
          <MessageCircle class="mr-2 h-6 w-6" />
          New Chat
        </SidebarGroupLabel>
      </NuxtLink>

      <SidebarGroup class="gap-1">
        <SidebarGroupLabel
          class="text-gray-500 font-semibold text-sm px-2 py-1 text-left dark:text-gray-400"
          >History</SidebarGroupLabel
        >
        <SidebarGroupContent
          v-for="(conv, index) in conversations"
          :key="conv.id"
          class="rounded-md group flex items-center justify-between"
        >
          <NuxtLink
            :to="{ name: 'chat-id', params: { id: conv.id } }"
            class="flex-1 min-w-0"
          >
            <SidebarMenu
              :class="[
                'text-sm font-sans p-2 rounded-md transition-colors duration-200 flex text-left',
                conv.id === currentConversationId
                  ? 'bg-gray-200 text-gray-900 font-semibold dark:bg-gray-700 dark:text-white'
                  : 'hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-700 dark:text-gray-300',
              ]"
            >
              <span class="truncate block">{{ conv.title }} </span>
            </SidebarMenu>
          </NuxtLink>
          <!-- Conversation Actions Dropdown -->
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button
                variant="ghost"
                size="icon"
                :class="[
                  'h-7 w-7 text-gray-500 hover:text-gray-700 hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800',
                  conv.id === currentConversationId ? 'opacity-100' : '',
                ]"
              >
                <MoreVertical class="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              class="w-40 bg-white border-gray-200 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            >
              <DropdownMenuItem
                @click="emit('editConversationTitle', conv.id)"
                class="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Edit Title
              </DropdownMenuItem>
              <DropdownMenuSeparator class="bg-gray-200 dark:bg-gray-700" />
              <DropdownMenuItem
                @click="emit('deleteConversation', conv.id)"
                class="cursor-pointer text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/50 dark:hover:text-red-300"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <!-- User Info Section -->
    <SidebarFooter class="p-4 border-t border-gray-200 dark:border-gray-800">
      <div class="flex items-center gap-3">
        <Avatar class="h-8 w-8">
          <AvatarImage
            :src="user?.picture"
            :alt="user?.name || 'User Avatar'"
          />
          <AvatarFallback
            class="text-gray-700 dark:bg-gray-700 dark:text-white"
            >{{
              user?.name?.charAt(0) || user?.email?.charAt(0) || "U"
            }}</AvatarFallback
          >
        </Avatar>
        <div class="flex-1">
          <p
            class="text-sm font-medium text-gray-900 truncate text-left dark:text-white"
          >
            {{ user?.name || user?.email || "Guest" }}
          </p>
          <p
            class="text-xs text-gray-500 truncate text-left dark:text-gray-400"
          >
            {{ user?.email || "Not logged in" }}
          </p>
        </div>
        <!-- Logout button or other user actions can go here -->
        <Button
          variant="ghost"
          size="icon"
          class="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
          @click="emit('logout')"
        >
          <Icon name="lucide:log-out" class="h-4 w-4" />
        </Button>
      </div>
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
