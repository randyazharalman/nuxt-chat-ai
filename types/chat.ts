import type { ROLE } from "@prisma/client"


export interface Message {
  id: string
  conversationId: string
  role: ROLE
  content: string
  createdAt: Date
}

export interface Conversation {
  id: string
  userId: string
  title: string | null
  createdAt: Date
  updatedAt: Date
  messages?: Message[]
}

export interface CreateMessageDTO {
  conversationId?: string
  content: string
  role: ROLE
}

export interface ChatRequest {
  messages: Array<{ role: "user" | "assistant"; content: string }>
  conversationId?: string | null
}

export interface ChatResponse {
  conversationId: string
  message: Message
}