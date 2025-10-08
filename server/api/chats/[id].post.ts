import z from "zod";
import process from "node:process"; // Explicitly import process
import { google } from "@ai-sdk/google";
import {
  streamText,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  UIMessage,
  streamObject,
} from "ai";
import { db } from "~/server/utils/db";
import { generateTitleFromUserMessage } from "~/server/utils/chat";
import { userService } from "~/server/services/user.service";
import { processFile } from "~/server/utils/processFile";
import { weatherTool } from "~/utils/tools/weather";
import { themeTool } from "~/utils/tools/theme";
import { summarizeTool } from "~/utils/tools/summarize";

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event);

  const { id } = await getValidatedRouterParams(
    event,
    z.object({
      id: z.string(),
    }).parse
  );

  console.log("convID", id);

  const { messages, attachments, model } = await readValidatedBody(
    event,
    z.object({
      model: z.string(),
      messages: z.array(z.custom<UIMessage>()),
      attachments: z
        .array(
          z.object({
            name: z.string(),
            url: z.string(),
            category: z.enum(["image", "audio", "pdf"]), 
            type: z.string(),
          })
        )
        .optional(),
    }).parse
  );

  console.log("attachments", attachments);
  console.log(messages[messages.length - 1]);
  console.log("model", model);

  console.log(
    "Messages received by API (after validation):",
    JSON.stringify(messages[messages.length - 1], null, 2)
  );


  const user = await userService.getOrCreateUser(session.sub, session.email);

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found",
    });
  }

  const chat = await db.conversation.findFirst({
    where: {
      id: id,
      userId: user.id,
    },
  });

  if (!chat) {
    throw createError({
      statusCode: 404,
      statusMessage: "Chat Conversation / Chat History not found",
    });
  }

  // Generate title jika belum ada
  if (!chat.title) {
    const message = messages[0];
    if (!message) {
      throw createError({
        statusCode: 400,
        statusMessage: "No message provided",
      });
    }
    const title = await generateTitleFromUserMessage({ message });
    await db.conversation.update({
      where: { id },
      data: {
        title: title || "New Chat",
      },
    });
  }

  // Process attachments if any
  let processedAttachments: any[] = [];
  if (attachments && attachments.length > 0) {
    processedAttachments = await Promise.all(
      attachments.map((file) => processFile(file))
    );
  }

  // Simpan pesan user terakhir ke database
  const lastMessage = messages[messages.length - 1];

  if (lastMessage?.role === "user") {
    // Ekstrak text content dari parts
    const parts = Array.isArray(lastMessage.parts)
      ? lastMessage.parts
      : [lastMessage.parts];

    const textContent = parts
      .filter((p) => p?.type === "text")
      .map((p) => p.text)
      .join(" ");

    // Simpan message dengan contentParts
    await db.message.create({
      data: {
        role: "USER",
        conversationId: chat.id,
        contentParts: JSON.stringify(lastMessage.parts),
        content: textContent,
      },
    });
  }

  // Extract the model name from the received model string (e.g., "google/gemini-2.5-flash" -> "gemini-2.5-flash")
  const modelName = model.split("/")[1];
  console.log("Model name for AI:", modelName);

  let systemPrompt = `You are a helpful and smart assistant. 
Be natural, helpful, and concise. 
Use tools like weather, theme, or summarize when relevant, but you may also reason without tools.`;

  if (attachments && attachments.length > 0) {
    const attachmentInfo = attachments
      .map((att) => `${att.name} (${att.category})`)
      .join(", ");
    systemPrompt += `\nThe user has attached the following files: ${attachmentInfo}. 
If they ask questions about these files, you can discuss or summarize them if you have access to the content.`;
  }

  console.log(systemPrompt);

  // Stream AI response
  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      const result = streamText({
        model: google(modelName),
        system: systemPrompt,
        messages: convertToModelMessages(messages), // Use the original messages
        tools: {
          weather: weatherTool,
          theme: themeTool,
          summarize: summarizeTool,
        },
        toolChoice: "auto",
      });

      result.consumeStream();

      writer.merge(
        result.toUIMessageStream({
          sendReasoning: true,
        })
      );
    },
    onFinish: async ({ messages: aiMessages }) => {
      // Simpan AI response dengan contentParts
      const lastAIMessage = aiMessages[aiMessages.length - 1];

      if (lastAIMessage) {
        // Ekstrak text content dari parts
        const parts = Array.isArray(lastAIMessage.parts)
          ? lastAIMessage.parts
          : [lastAIMessage.parts];

        const textContent = parts
          .filter((p) => p?.type === "text")
          .map((p) => p.text)
          .join(" ");

        await db.message.create({
          data: {
            conversationId: chat.id,
            role: "ASSISTANT",
            contentParts: JSON.stringify(lastAIMessage.parts),
            content: textContent,
          },
        });
      }
    },
  });

  return createUIMessageStreamResponse({
    stream,
  });
});
