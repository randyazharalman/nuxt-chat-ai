import { Conversation } from '@prisma/client';
import { db } from '../utils/db';

export class ConversationRepository {
  async findByUserId(userId: string, limit: number = 50): Promise<Conversation[]> {
    return await db.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: limit
    })
  }

  async findById(id: string, userId: string): Promise<Conversation | null> {
    return await db.conversation.findFirst({
      where: { id, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })
  }

  async create(data: { userId: string; title: string }): Promise<Conversation> {
    return await db.conversation.create({
      data: {
        userId: data.userId,
        title: data.title
      }
    })
  }

  async update(id: string, data: Partial<Conversation>): Promise<Conversation> {
    return await db.conversation.update({
      where: {id},
      data: data
    })
  }

  async delete(id: string, userId: string): Promise<void> {
    await db.conversation.deleteMany({
      where: { id, userId }
    })
  }
}

export const conversationRepository = new ConversationRepository()