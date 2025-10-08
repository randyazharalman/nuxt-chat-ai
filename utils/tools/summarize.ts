// utils/tools/summarize.ts
import type { ToolUIPart } from 'ai'
import { tool } from 'ai'
import { z } from 'zod'

export const summarizeInputSchema = z.object({
  text: z.string().describe('The text content to summarize'),
  style: z.enum(['brief', 'detailed', 'bullet-points']).optional().default('brief').describe('Summary style: brief (2-3 sentences), detailed (1 paragraph), or bullet-points')
})

export type SummarizeInput = z.infer<typeof summarizeInputSchema>

export const summarizeOutputSchema = z.object({
  originalLength: z.number(),
  summaryLength: z.number(),
  summary: z.string(),
  keyPoints: z.array(z.string()),
  style: z.string()
})

export type SummarizeOutput = z.infer<typeof summarizeOutputSchema>
export type SummarizeToolUIPart = ToolUIPart & { output: SummarizeOutput }

export const summarizeTool = tool({
  description: 'Summarizes long text content into concise key points. Use this when user asks to summarize, recap, or get main points from text, articles, or documents.',
  inputSchema: summarizeInputSchema,
  execute: async ({ text, style = 'brief' }) => {
    console.log('⚡ Summarize tool executing with style:', style)
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000))

    // This is a placeholder - in production, you'd use AI to actually summarize
    const words = text.split(/\s+/).filter(w => w.length > 0)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    
    let summary = ''
    let keyPoints: string[] = []

    if (style === 'brief') {
      summary = `This content discusses ${words.length} words across ${sentences.length} sentences. The main focus appears to be on the key topics mentioned throughout the text.`
      keyPoints = sentences.slice(0, 3).map(s => s.trim().substring(0, 100))
    } else if (style === 'detailed') {
      summary = `The provided text contains ${words.length} words organized into ${sentences.length} sentences. The content covers various aspects and provides detailed information about the subject matter. Key themes and ideas are presented throughout, offering comprehensive insights into the topic.`
      keyPoints = sentences.slice(0, 5).map(s => s.trim().substring(0, 100))
    } else {
      summary = 'Summary in bullet-point format'
      keyPoints = sentences.slice(0, 5).map(s => s.trim().substring(0, 100))
    }

    const result = {
      originalLength: text.length,
      summaryLength: summary.length,
      summary,
      keyPoints: keyPoints.filter(k => k.length > 0),
      style
    }

    console.log('✅ Summary generated:', result)
    return result
  }
})