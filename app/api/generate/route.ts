import { generateText, Output } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'

const itemSuggestionSchema = z.object({
  description: z.string().describe('Professional description of the service or product'),
  suggestedPrice: z.number().describe('Suggested price based on market rates'),
  reasoning: z.string().describe('Brief reasoning for the suggestion'),
})

const invoiceNotesSchema = z.object({
  paymentTerms: z.string().describe('Professional payment terms'),
  notes: z.string().describe('Professional notes or thank you message'),
  suggestions: z.array(z.string()).describe('Additional suggestions for the invoice'),
})

export async function POST(req: Request) {
  try {
    const { type, context, settings } = await req.json()
    
    // Create provider based on settings
    let model
    if (settings.provider === 'vercel-gateway') {
      // Use Vercel AI Gateway directly with model string
      model = settings.model || 'openai/gpt-4o-mini'
    } else {
      // For Ollama and OpenAI-compatible endpoints
      const provider = createOpenAI({
        baseURL: settings.provider === 'ollama' 
          ? `${settings.baseUrl}/v1`
          : settings.baseUrl,
        apiKey: settings.apiKey || 'ollama', // Ollama doesn't require API key
      })
      model = provider(settings.model)
    }

    if (type === 'enhance-description') {
      const { output } = await generateText({
        model,
        output: Output.object({ schema: itemSuggestionSchema }),
        messages: [
          {
            role: 'system',
            content: 'You are a professional invoice writer. Enhance item descriptions to be clear, professional, and detailed. Suggest appropriate pricing based on industry standards.',
          },
          {
            role: 'user',
            content: `Enhance this invoice item description and suggest pricing:
            
Original description: ${context.description}
Service type: ${context.serviceType || 'General'}
Client industry: ${context.clientIndustry || 'Not specified'}

Provide a professional description and suggest a fair price.`,
          },
        ],
      })

      return Response.json({ success: true, data: output })
    }

    if (type === 'generate-notes') {
      const { output } = await generateText({
        model,
        output: Output.object({ schema: invoiceNotesSchema }),
        messages: [
          {
            role: 'system',
            content: 'You are a professional invoice writer. Generate professional payment terms and notes for invoices.',
          },
          {
            role: 'user',
            content: `Generate professional payment terms and notes for this invoice:

Client name: ${context.clientName}
Invoice total: ${context.total}
Service description: ${context.serviceDescription || 'Professional services'}
Due in days: ${context.dueDays || 30}

Provide professional payment terms, a friendly note, and any suggestions.`,
          },
        ],
      })

      return Response.json({ success: true, data: output })
    }

    if (type === 'suggest-items') {
      const suggestSchema = z.object({
        items: z.array(z.object({
          description: z.string(),
          suggestedQuantity: z.number(),
          suggestedPrice: z.number(),
        })).describe('List of suggested invoice items'),
      })

      const { output } = await generateText({
        model,
        output: Output.object({ schema: suggestSchema }),
        messages: [
          {
            role: 'system',
            content: 'You are a professional invoice writer. Suggest relevant invoice items based on the project description.',
          },
          {
            role: 'user',
            content: `Suggest invoice items for this project:

Project description: ${context.projectDescription}
Client industry: ${context.clientIndustry || 'Not specified'}
Budget range: ${context.budgetRange || 'Not specified'}

Suggest 3-5 relevant line items with descriptions, quantities, and prices.`,
          },
        ],
      })

      return Response.json({ success: true, data: output })
    }

    return Response.json({ success: false, error: 'Unknown generation type' }, { status: 400 })
  } catch (error) {
    console.error('[AI Generate Error]', error)
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate content' 
    }, { status: 500 })
  }
}
