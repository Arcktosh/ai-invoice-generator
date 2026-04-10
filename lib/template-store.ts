import { InvoiceTemplate, BUILT_IN_TEMPLATES } from './template-types'

const STORAGE_KEY = 'invoice-generator-templates'
const ACTIVE_TEMPLATE_KEY = 'invoice-generator-active-template'

export function getCustomTemplates(): InvoiceTemplate[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function getAllTemplates(): InvoiceTemplate[] {
  return [...BUILT_IN_TEMPLATES, ...getCustomTemplates()]
}

export function saveCustomTemplate(template: InvoiceTemplate): void {
  const customs = getCustomTemplates()
  const existing = customs.findIndex(t => t.id === template.id)
  const updated = template.id.startsWith('builtin-')
    ? // Cannot overwrite built-ins — save as a new custom copy instead
      customs
    : existing >= 0
      ? customs.map(t => t.id === template.id ? template : t)
      : [...customs, template]

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export function deleteCustomTemplate(id: string): void {
  if (id.startsWith('builtin-')) return // protect built-ins
  const customs = getCustomTemplates().filter(t => t.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customs))
}

export function getActiveTemplateId(): string {
  if (typeof window === 'undefined') return 'builtin-classic'
  return localStorage.getItem(ACTIVE_TEMPLATE_KEY) ?? 'builtin-classic'
}

export function setActiveTemplateId(id: string): void {
  localStorage.setItem(ACTIVE_TEMPLATE_KEY, id)
}

export function getActiveTemplate(): InvoiceTemplate {
  const id = getActiveTemplateId()
  return getAllTemplates().find(t => t.id === id) ?? BUILT_IN_TEMPLATES[0]
}
