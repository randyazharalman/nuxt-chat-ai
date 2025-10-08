import type { Conversation } from "~/types/chat"

export const useConversation = () => {
  const conversations = useState<Conversation[]>('conversations', () => [])
  const currentConversation = useState<Conversation | null>('current-conversation', () => null)
  const isLoading = useState('conversation-loading', () => false)

  const loadConversations = async () => {
    isLoading.value = true
    try {
      const data = await $fetch<Conversation[]>('/api/conversations')
      conversations.value = data
    } catch (error) {
      console.error('Failed to load conversations:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const loadConversation = async (id: string) => {
    isLoading.value = true
    try {
      const data = await $fetch<Conversation>(`/api/conversations/${id}`)
      currentConversation.value = data
      return data
    } catch (error) {
      console.error('Failed to load conversation:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const refreshConversations = async () => {
    await loadConversations();
  };

  const createNewConversation = () => {
    currentConversation.value = null
  }

  return {
    conversations,
    currentConversation: readonly(currentConversation),
    isLoading: readonly(isLoading),
    loadConversations,
    loadConversation,
    createNewConversation,
    refreshConversations,
  }
}
