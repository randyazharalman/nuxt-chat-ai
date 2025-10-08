import z from "zod";
import { db } from "~/server/utils/db";
import { requireAuth } from "~/server/utils/auth";
import { conversationService } from "~/server/services/conversation.service";
import { userService } from "~/server/services/user.service"; // Import userService

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event);

  const { id } = await getValidatedRouterParams(
    event,
    z.object({
      id: z.string(),
    }).parse
  );

  const { title } = await readValidatedBody(
    event,
    z.object({
      title: z.string().min(1, "Title cannot be empty"),
    }).parse
  );

  const user = await userService.getOrCreateUser(session.sub, session.email);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "User not found in database",
    });
  }

  const conversation = await conversationService.getConversationById(id, user.id); 
  console.log("PATCH - Session Sub (Logto ID):", session.sub);
  console.log("PATCH - Internal User ID:", user.id);
  console.log("PATCH - Conversation User ID:", conversation?.userId);

  if (!conversation || conversation.userId !== user.id) { 
    throw createError({
      statusCode: 403,
      statusMessage: "Unauthorized",
    });
  }

  const updatedConversation = await conversationService.updateConversation(id, {title})

  return updatedConversation;
});
