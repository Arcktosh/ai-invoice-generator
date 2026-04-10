export type TemplateLayout = 'classic' | 'modern' | 'compact' | 'bold'
export type TemplateFontStyle = 'sans' | 'serif' | 'mono'

export interface InvoiceTemplate {
  id: string
  name: string
  description?: string

  // Branding
  companyName: string
  companyTagline?: string
  companyEmail?: string
  companyPhone?: string
  companyWebsite?: string
  companyAddress?: string

  // Design
  layout: TemplateLayout
  accentColor: string      // hex color for headings, borders, totals bar
  backgroundColor: string  // invoice background (usually white)
  textColor: string        // primary text color
  mutedColor: string       // secondary / muted text color
  fontStyle: TemplateFontStyle

  // Content defaults
  defaultTaxRate: number
  defaultPaymentTerms?: string
  defaultNotes?: string
  footerText?: string

  // Meta
  createdAt: string
  updatedAt: string
}

export const PRESET_COLORS = [
  { label: 'Slate',    accent: '#1e293b', muted: '#64748b' },
  { label: 'Blue',     accent: '#1d4ed8', muted: '#6b7280' },
  { label: 'Emerald',  accent: '#065f46', muted: '#6b7280' },
  { label: 'Rose',     accent: '#9f1239', muted: '#6b7280' },
  { label: 'Amber',    accent: '#92400e', muted: '#6b7280' },
  { label: 'Violet',   accent: '#4c1d95', muted: '#6b7280' },
]

export const LAYOUT_OPTIONS: { value: TemplateLayout; label: string; description: string }[] = [
  { value: 'classic',  label: 'Classic',  description: 'Traditional header with FROM / BILL TO side by side' },
  { value: 'modern',   label: 'Modern',   description: 'Accent sidebar stripe with large invoice number' },
  { value: 'compact',  label: 'Compact',  description: 'Dense layout ideal for simple invoices' },
  { value: 'bold',     label: 'Bold',     description: 'Full-color header block with white text' },
]

export function createDefaultTemplate(overrides: Partial<InvoiceTemplate> = {}): InvoiceTemplate {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    name: 'New Template',
    description: '',
    companyName: '',
    companyTagline: '',
    companyEmail: '',
    companyPhone: '',
    companyWebsite: '',
    companyAddress: '',
    layout: 'classic',
    accentColor: '#1e293b',
    backgroundColor: '#ffffff',
    textColor: '#0f172a',
    mutedColor: '#64748b',
    fontStyle: 'sans',
    defaultTaxRate: 0,
    defaultPaymentTerms: '',
    defaultNotes: '',
    footerText: 'Thank you for your business.',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

export const BUILT_IN_TEMPLATES: InvoiceTemplate[] = [
  createDefaultTemplate({
    id: 'builtin-classic',
    name: 'Classic',
    description: 'Clean, professional, timeless',
    layout: 'classic',
    accentColor: '#1e293b',
    backgroundColor: '#ffffff',
    textColor: '#0f172a',
    mutedColor: '#64748b',
    fontStyle: 'sans',
    footerText: 'Thank you for your business.',
  }),
  createDefaultTemplate({
    id: 'builtin-modern',
    name: 'Modern',
    description: 'Contemporary with accent stripe',
    layout: 'modern',
    accentColor: '#1d4ed8',
    backgroundColor: '#ffffff',
    textColor: '#0f172a',
    mutedColor: '#6b7280',
    fontStyle: 'sans',
    footerText: 'We appreciate your business.',
  }),
  createDefaultTemplate({
    id: 'builtin-bold',
    name: 'Bold',
    description: 'High-impact colored header',
    layout: 'bold',
    accentColor: '#065f46',
    backgroundColor: '#ffffff',
    textColor: '#0f172a',
    mutedColor: '#6b7280',
    fontStyle: 'sans',
    footerText: 'Thank you — we look forward to working with you again.',
  }),
  createDefaultTemplate({
    id: 'builtin-compact',
    name: 'Compact',
    description: 'Space-efficient minimal layout',
    layout: 'compact',
    accentColor: '#92400e',
    backgroundColor: '#ffffff',
    textColor: '#1c1917',
    mutedColor: '#78716c',
    fontStyle: 'mono',
    footerText: '',
  }),
]
