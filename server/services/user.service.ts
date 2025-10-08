import { User } from '@prisma/client'
import { userRepository } from '../repositories/user.repository'

export class UserService {

  async getOrCreateUser(logtoId: string, email?: string): Promise<User> {
    let user = await userRepository.findByLogtoId(logtoId)
    
    if (!user) {
      user = await userRepository.create({ logtoId, email })
    }
    
    return user
  }

  async getUserById(id: string): Promise<User | null> {
    return await userRepository.findById(id)
  }

  async updateUserEmail(id: string, email: string): Promise<User> {
    return await userRepository.update(id, { email })
  }
}

export const userService = new UserService()