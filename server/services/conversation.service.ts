import { Conversation, User } from '@prisma/client'
import { userRepository } from '../repositories/user.repository'
import { conversationRepository } from '../repositories/conversation.repository'

export class ConversationService {
  async getUserConversations(userId: string): Promise<Conversation[]> {
    let conversation = await conversationRepository.findByUserId(userId)
    
    if (!conversation) {
      throw new Error("Conversation not found")
      
    }
    
    return conversation
  }

  async getConversationById(id: string,  userId: string): Promise<Conversation | null> {
    return await conversationRepository.findById(id, userId)
  }


  async updateConversation(id: string, data: Partial<Conversation>): Promise<Conversation> {
    return await conversationRepository.update(id, data)
  }
}

export const conversationService = new ConversationService()