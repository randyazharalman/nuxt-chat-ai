import type { ToolUIPart } from 'ai'
import { tool } from 'ai'
import { z } from 'zod'

export const themeInputSchema = z.object({})

export type ThemeInput = z.infer<typeof themeInputSchema>

export const themeOutputSchema = z.object({
  message: z.string()
})

export type ThemeOutput = z.infer<typeof themeOutputSchema>
export type ThemeToolUIPart = ToolUIPart & { output: ThemeOutput }

export const themeTool = tool({
  description: 'Toggle between light and dark theme. Use this when user asks to change theme, enable dark mode, or adjust appearance.',
  inputSchema: themeInputSchema,
  execute: async () => {
    return {
      message: 'Theme toggled successfully'
    }
  }
})
