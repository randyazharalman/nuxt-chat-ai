import { UIMessage } from "ai";

// Define types that match ai-sdk's expected input for generateText
type TextPart = { type: "text"; text: string };
type ImagePart = { type: "image_url"; image_url: string };
type AIMessageContent = string | Array<TextPart | ImagePart>;

interface AIMessage {
  role: "user" | "assistant" | "system";
  content: AIMessageContent;
}

export function prepareModelMessages(messages: UIMessage[]): AIMessage[] {
  return messages.map((m) => {
    if (m.role === "user") {
      const contentParts: Array<TextPart | ImagePart> = [];

      for (const part of m.parts || []) {
        if (part.type === "text" && part.text?.trim()) {
          contentParts.push({ type: "text", text: part.text });
        } else if (part.type === "image_url") {
          // Ensure part.image_url exists before pushing
          if (part.image_url) {
            contentParts.push({ type: "image_url", image_url: part.image_url });
          }
        }
        // For other file types (pdf, document) which are processed into text in buildPrompt,
        // they will already be part of a 'text' UIMessage part, so they are handled by the first 'if'.
      }

      return {
        role: "user",
        content: contentParts,
      };
    }

    // For system and assistant, content is expected to be a string
    if (m.role === "assistant" || m.role === "system") {
      const text =
        typeof m.content === "string"
          ? m.content
          : JSON.stringify(m.content); // UIMessage.content can be object, so stringify
      return {
        role: m.role,
        content: text,
      };
    }

    return null;
  }).filter(Boolean) as AIMessage[];
}
