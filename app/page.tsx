'use client'

import { useState, useRef, useEffect } from 'react'
import { Download, FileText, Eye, Edit3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AISettingsDialog } from '@/components/ai-settings-dialog'
import { InvoiceForm } from '@/components/invoice-form'
import { InvoicePreview } from '@/components/invoice-preview'
import { TemplateManager } from '@/components/template-manager'
import { InvoiceData, generateInvoiceNumber } from '@/lib/invoice-types'
import { InvoiceTemplate } from '@/lib/template-types'
import { getActiveTemplate } from '@/lib/template-store'

function getDefaultInvoice(): InvoiceData {
  const today = new Date()
  const dueDate = new Date(today)
  dueDate.setDate(dueDate.getDate() + 30)

  return {
    invoiceNumber: generateInvoiceNumber(),
    issueDate: today.toISOString().split('T')[0],
    dueDate: dueDate.toISOString().split('T')[0],
    senderName: '',
    senderEmail: '',
    senderAddress: '',
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    items: [],
    taxRate: 0,
    notes: '',
    paymentTerms: '',
  }
}

export default function InvoiceGenerator() {
  const [invoice, setInvoice] = useState<InvoiceData>(getDefaultInvoice)
  const [template, setTemplate] = useState<InvoiceTemplate | null>(null)
  const [activeTab, setActiveTab] = useState('edit')
  const previewRef = useRef<HTMLDivElement>(null)

  // Load active template on mount (client only — localStorage)
  useEffect(() => {
    setTemplate(getActiveTemplate())
  }, [])

  const handleTemplateChange = (t: InvoiceTemplate) => {
    setTemplate(t)
    // Apply template defaults into the invoice if the fields are empty
    setInvoice(prev => ({
      ...prev,
      taxRate: prev.taxRate === 0 && t.defaultTaxRate > 0 ? t.defaultTaxRate : prev.taxRate,
      paymentTerms: !prev.paymentTerms && t.defaultPaymentTerms ? t.defaultPaymentTerms : prev.paymentTerms,
      notes: !prev.notes && t.defaultNotes ? t.defaultNotes : prev.notes,
    }))
  }

  const downloadPDF = async () => {
    if (!previewRef.current) return

    try {
      const html2canvas = (await import('html2canvas')).default

      // Clone the element for PDF rendering
      const clone = previewRef.current.cloneNode(true) as HTMLElement
      clone.style.position = 'absolute'
      clone.style.left = '-9999px'
      clone.style.top = '0'
      clone.style.width = `${previewRef.current.offsetWidth}px`
      
      // Inject a style tag to override all Tailwind CSS variables with RGB fallbacks
      // This fixes html2canvas not supporting lab() color function
      const styleOverride = document.createElement('style')
      styleOverride.textContent = `
        * {
          --background: 255 255 255 !important;
          --foreground: 10 10 10 !important;
          --card: 255 255 255 !important;
          --card-foreground: 10 10 10 !important;
          --popover: 255 255 255 !important;
          --popover-foreground: 10 10 10 !important;
          --primary: 24 24 27 !important;
          --primary-foreground: 250 250 250 !important;
          --secondary: 244 244 245 !important;
          --secondary-foreground: 24 24 27 !important;
          --muted: 244 244 245 !important;
          --muted-foreground: 113 113 122 !important;
          --accent: 244 244 245 !important;
          --accent-foreground: 24 24 27 !important;
          --destructive: 239 68 68 !important;
          --destructive-foreground: 250 250 250 !important;
          --border: 228 228 231 !important;
          --input: 228 228 231 !important;
          --ring: 24 24 27 !important;
        }
      `
      clone.prepend(styleOverride)

      // Also directly set computed RGB values on all elements
      const setRGBColors = (el: HTMLElement) => {
        const computed = getComputedStyle(el)
        const colorProps = ['color', 'background-color', 'border-color', 'border-top-color', 'border-bottom-color', 'border-left-color', 'border-right-color']
        
        colorProps.forEach(prop => {
          const value = computed.getPropertyValue(prop)
          if (value && (value.includes('lab(') || value.includes('oklch(') || value.includes('oklab('))) {
            // Force to a safe fallback
            const camelProp = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
            if (prop === 'color') {
              (el.style as Record<string, string>)[camelProp] = '#0a0a0a'
            } else if (prop === 'background-color') {
              (el.style as Record<string, string>)[camelProp] = '#ffffff'
            } else {
              (el.style as Record<string, string>)[camelProp] = '#e4e4e7'
            }
          }
        })

        Array.from(el.children).forEach(child => {
          if (child instanceof HTMLElement) setRGBColors(child)
        })
      }

      document.body.appendChild(clone)
      setRGBColors(clone)

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      })

      document.body.removeChild(clone)

      const imgData = canvas.toDataURL('image/png')
      const { jsPDF } = await import('jspdf/dist/jspdf.es.min.js')

      const pageWidth = 210
      const imgWidth = pageWidth - 20
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight)
      pdf.save(`${invoice.invoiceNumber || 'invoice'}.pdf`)
    } catch (error) {
      alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const downloadJSON = () => {
    const payload = { invoice, templateId: template?.id }
    const dataStr = JSON.stringify(payload, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${invoice.invoiceNumber || 'invoice'}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const loadJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        // Support both old format (raw InvoiceData) and new format ({ invoice, templateId })
        if (data.invoice) {
          setInvoice(data.invoice)
        } else {
          setInvoice(data)
        }
      } catch {
        alert('Invalid JSON file')
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  // Don't render preview until template is hydrated from localStorage
  if (!template) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-sm text-neutral-400">Loading…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-neutral-900" />
              <h1 className="text-lg font-semibold text-neutral-900">Invoice Generator</h1>
              <span className="hidden sm:inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                AI Powered
              </span>
            </div>

            <div className="flex items-center gap-2">
              <TemplateManager onTemplateChange={handleTemplateChange} />
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  onChange={loadJSON}
                  className="hidden"
                />
                <Button variant="outline" size="sm" asChild>
                  <span>Load</span>
                </Button>
              </label>
              <Button variant="outline" size="sm" onClick={downloadJSON}>
                Save
              </Button>
              <Button size="sm" onClick={downloadPDF}>
                <Download className="mr-2 h-4 w-4" />
                PDF
              </Button>
              <AISettingsDialog />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Tabs */}
        <div className="lg:hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="edit" className="flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                Edit
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>
            <TabsContent value="edit">
              <InvoiceForm invoice={invoice} onChange={setInvoice} templateName={template.name} />
            </TabsContent>
            <TabsContent value="preview">
              <div className="overflow-auto">
                <InvoicePreview ref={previewRef} invoice={invoice} template={template} />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop Side-by-Side */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-8">
          <div>
            <h2 className="text-sm font-medium text-neutral-500 mb-4 flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Edit Invoice
            </h2>
            <InvoiceForm invoice={invoice} onChange={setInvoice} templateName={template.name} />
          </div>
          <div className="sticky top-24 self-start">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-neutral-500 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </h2>
              <span className="text-xs text-neutral-400 capitalize">
                {template.layout} · {template.name}
              </span>
            </div>
            <div className="overflow-auto max-h-[calc(100vh-8rem)] rounded-lg border bg-neutral-100 p-4">
              <InvoicePreview ref={previewRef} invoice={invoice} template={template} />
            </div>
          </div>
        </div>
      </main>

      {/* Setup Instructions */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="rounded-lg border bg-white p-6">
          <h3 className="font-semibold text-neutral-900 mb-3">Self-Hosting with Local AI</h3>
          <div className="text-sm text-neutral-600 space-y-2">
            <p><strong>1. Install Ollama:</strong> Visit <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ollama.ai</a> and follow the installation instructions for your OS.</p>
            <p><strong>2. Pull a model:</strong> Run <code className="px-1.5 py-0.5 bg-neutral-100 rounded text-xs">ollama pull llama3.2</code> in your terminal.</p>
            <p><strong>3. Configure:</strong> Click the settings icon above to configure your AI provider. Ollama runs on <code className="px-1.5 py-0.5 bg-neutral-100 rounded text-xs">http://localhost:11434</code> by default.</p>
            <p><strong>4. Templates:</strong> Click &quot;Templates&quot; to choose or create branded invoice designs with custom colors, layouts, and company info.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
