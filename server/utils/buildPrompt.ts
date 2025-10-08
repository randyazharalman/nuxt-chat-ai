// ~/server/utils/prompt.ts
import { processFile, Attachment } from "./processFile"; // Import processFile and Attachment type

// Define a local Part type that matches ai-sdk's expected content structure
type Part = { type: "text"; text: string } | { type: "image_url"; image_url: string };

export async function buildPrompt(userMessage: string, attachments?: Attachment[]): Promise<Part[]> {
  const contentParts: Part[] = [];

  if (userMessage) {
    contentParts.push({ type: "text", text: userMessage });
  }

  if (attachments && attachments.length > 0) {
    for (const attachment of attachments) {
      const processed = await processFile(attachment);
      if (processed.aiPart) {
        if (processed.aiPart.type === "image_url") {
          contentParts.push({ type: "image_url", image_url: processed.aiPart.image_url });
        } else if (processed.aiPart.type === "text") {
          contentParts.push({ type: "text", text: processed.aiPart.text });
        } else if (processed.aiPart.type === "file_url") {
          // For file_url, we'll push the text part for now, as direct file_url type is not standard in ai-sdk Part.
          // The text field in aiPart.text already contains the URL and description.
          contentParts.push({ type: "text", text: processed.aiPart.text });
        }
      }
    }
  }

  return contentParts;
}
