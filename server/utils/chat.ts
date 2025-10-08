import { gateway, generateText, UIMessage } from "ai"
import type { UserSession } from '#auth-utils'
import { google } from "@ai-sdk/google"
export async function generateTitleFromUserMessage({
  message
}: {
  message: UIMessage
}) {
  const { text: title } = await generateText({
    model: google("gemini-2.5-flash"),
    system: `You are a title generator for a chat:
        - Generate a short title based on the first user's message
        - The title should be less than 30 characters long
        - The title should be a summary of the user's message
        - Do not use quotes (' or ") or colons (:) or any other punctuation
        - Do not use markdown, just plain text`,
    prompt: JSON.stringify(message)
  })

  return title
}
