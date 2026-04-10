export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
}

export interface InvoiceData {
  invoiceNumber: string
  issueDate: string
  dueDate: string
  
  // Sender
  senderName: string
  senderEmail: string
  senderAddress: string
  senderPhone?: string
  
  // Client
  clientName: string
  clientEmail: string
  clientAddress: string
  clientPhone?: string
  
  // Items
  items: InvoiceItem[]
  
  // Payment
  taxRate: number
  notes?: string
  paymentTerms?: string
}

export interface AISettings {
  provider: 'ollama' | 'openai-compatible' | 'vercel-gateway'
  baseUrl: string
  model: string
  apiKey?: string
}

export const defaultAISettings: AISettings = {
  provider: 'ollama',
  baseUrl: 'http://localhost:11434',
  model: 'llama3.2',
}

export function calculateInvoiceTotals(items: InvoiceItem[], taxRate: number) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const tax = subtotal * (taxRate / 100)
  const total = subtotal + tax
  return { subtotal, tax, total }
}

export function generateInvoiceNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `INV-${year}${month}-${random}`
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
