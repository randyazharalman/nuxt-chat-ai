// server/utils/processFile.ts
import { z } from "zod";

export const AttachmentSchema = z.object({
  name: z.string(),
  type: z.string(),
  category: z.enum(["image", "audio", "pdf", "document"]),
  url: z.string().url(),
  size: z.number().optional(),
  path: z.string().optional(),
});

export type Attachment = z.infer<typeof AttachmentSchema>;

export async function processFile(file: Attachment) {
  const base = {
    name: file.name,
    type: file.type,
    category: file.category,
    url: file.url,
    size: file.size ?? 0,
    path: file.path ?? "",
    processedAt: new Date().toISOString(),
  };

  switch (file.category) {
    case "image":
      return {
        ...base,
        kind: "media",
        aiPart: {
          type: "image_url" as const, // Changed to image_url
          image_url: file.url,
        },
      };

    case "audio":
      return {
        ...base,
        kind: "media",
        aiPart: {
          type: "text" as const,
          text: `[Audio file: ${file.name}](${file.url}) - Please note: I cannot directly process audio content, but this file is available at the provided URL.`,
        },
      };

    case "pdf":
    case "document":
      return {
        ...base,
        kind: "file",
        aiPart: {
          type: "file_url" as const, // New type for documents
          file_url: file.url,
          mime_type: file.type,
          text: `[Document: ${file.name} (${file.type})] - Please analyze the content of this document from the provided URL: ${file.url}`,
        },
      };

    default:
      return {
        ...base,
        kind: "unknown",
        aiPart: {
          type: "text" as const,
          text: `[Attached file: ${file.name}] - This file is available at: ${file.url}`,
        },
      };
  }
}
