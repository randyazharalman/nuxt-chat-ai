import { conversationService, ConversationService } from '~/server/services/conversation.service';
import { userService } from '~/server/services/user.service';
import { requireAuth } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const userSession = await requireAuth(event);

  try {
    const user = await userService.getOrCreateUser(userSession.sub, userSession.email)
    const conversations = await conversationService.getUserConversations(user.id)

    return conversations;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch conversations',
    });
  }
});
