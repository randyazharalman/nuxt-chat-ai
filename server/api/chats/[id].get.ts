import { z } from "zod";
import { db } from "~/server/utils/db";
import type { UIMessage } from "ai";

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event);

  const { id } = await getValidatedRouterParams(
    event,
    z.object({
      id: z.string(),
    }).parse
  );

  // Get user
  const user = await db.user.findUnique({
    where: { logtoId: session.sub },
  });

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found",
    });
  }

  // Get conversation with messages
  const conversation = await db.conversation.findFirst({
    where: {
      id: id,
      userId: user.id,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!conversation) {
    throw createError({
      statusCode: 404,
      statusMessage: "Conversation not found",
    });
  }

  // Convert messages to UIMessage format
  const messages: UIMessage[] = conversation.messages.map((msg) => {
    let parts;
    
    try {
      // Parse contentParts dari JSON
      parts = JSON.parse(msg.contentParts as string);
    } catch (error) {
      // Fallback jika contentParts tidak valid, gunakan content text
      parts = [
        {
          type: "text",
          text: msg.content,
        },
      ];
    }

    return {
      id: msg.id,
      role: msg.role.toLowerCase() as "user" | "assistant",
      parts: parts,
      createdAt: msg.createdAt,
    };
  });

  return {
    id: conversation.id,
    title: conversation.title,
    messages: messages,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
});