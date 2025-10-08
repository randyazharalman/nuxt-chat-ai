import { User } from '@prisma/client';
import { db } from '~/server/utils/db'



export class UserRepository {
  async findByLogtoId(logtoId: string): Promise<User | null> {
    return await db.user.findUnique({
      where: { logtoId }
    })
  }

  async findById(id: string): Promise<User | null> {
    return await db.user.findUnique({
      where: { id }
    })
  }

  async create(data: { logtoId: string; email?: string }): Promise<User> {
    return await db.user.create({
      data: {
        logtoId: data.logtoId,
        email: data.email
      }
    })
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    return await db.user.update({
      where: { id },
      data
    })
  }
}

export const userRepository = new UserRepository()