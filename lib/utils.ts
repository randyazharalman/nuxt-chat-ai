import type { ClassValue } from "clsx"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { codeToHtml } from "shiki"
import type { UIMessage } from "ai"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


const getMessageText = (message: UIMessage): string => {
  const parts = message.parts;

  if (!parts) {
    return typeof (message as any).content === "string"
      ? (message as any).content
      : "";
  }

  const arr = Array.isArray(parts) ? parts : [parts];

  const texts = arr
    .filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
    .map((p) => p.text);

  return texts.join("\n");
};


export const highlightCode = async(code: string, lang: string) => {
  try {
    return await codeToHtml(code, {
      lang,
      theme: document.documentElement.classList.contains("dark")
        ? "github-dark-default"
        : "github-light-default",
    })
  } catch {
    return await codeToHtml(code, { lang: "text", theme: "github-light-default" })
  }
}


