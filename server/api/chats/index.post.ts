import z from "zod";
import { google } from "@ai-sdk/google";
import {
  streamText,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  UIMessage,
} from "ai";
import { db } from "~/server/utils/db";
import { requireAuth } from "~/server/utils/auth";
import { generateTitleFromUserMessage } from "~/server/utils/chat";
import { userService } from "~/server/services/user.service";
import { weatherTool } from "~/utils/tools/weather";
import { themeTool } from "~/utils/tools/theme";
import { summarizeTool } from "~/utils/tools/summarize";

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event);
  const { input, conversationId, model } = await readBody(event);

  console.log(input, conversationId, model);

  if (!input?.trim()) {
    throw createError({ statusCode: 400, message: "Input cannot be empty" });
  }

  const user = await userService.getOrCreateUser(session.sub, session.email);

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found",
    });
  }

  let conversation;

  if (conversationId) {
    conversation = await db.conversation.findUnique({
      where: { id: conversationId },
    });
  }

  const title = await generateTitleFromUserMessage({message: input})

  if (!conversation) {
    conversation = await db.conversation.create({
      data: {
        title: title,
        userId: user.id,
      },
    });
  }

  const contentParts = [
    {
      type: "text",
      text: input,
    },
  ];

  // Simpan pesan user dengan contentParts
  const userMessage = await db.message.create({
    data: {
      conversationId: conversation.id,
      role: "USER",
      content: input,
      contentParts: JSON.stringify(contentParts),
    },
  });


  const modelName = model.split('/')[1];

  const messagesForAI = [
    {
      id: userMessage.id,
      role: "user",
      content: userMessage.content,
      parts: JSON.parse(userMessage.contentParts as string), 
    } as UIMessage,
  ];

  // Stream AI response
  const result = await streamText({
    model: google(modelName),
    system: `You are a helpful and smart assistant. 
Be natural, helpful, and concise. 
Use tools like weather, theme, or summarize when relevant, but you may also reason without tools.`,
    messages: convertToModelMessages(messagesForAI),
    tools: {
      weather: weatherTool,
      theme: themeTool,
      summarize: summarizeTool
    },
    toolChoice: "auto"
  });

  let aiResponseContent = "";
  for await (const textPart of result.textStream) {
    aiResponseContent += textPart;
  }

  // Buat contentParts sesuai format Vercel AI SDK untuk AI response
  const aiContentParts = [
    {
      type: "text",
      text: aiResponseContent,
    },
  ];

  // Simpan pesan AI dengan contentParts
  const aiMessage = await db.message.create({
    data: {
      conversationId: conversation.id,
      role: "ASSISTANT",
      content: aiResponseContent,
      contentParts: JSON.stringify(aiContentParts),
    },
  });

  return {
    success: true,
    conversationId: conversation.id,
    messages: [userMessage, aiMessage], 
  };
});
