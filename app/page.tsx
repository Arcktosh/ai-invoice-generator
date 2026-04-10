'use client'

import { useState, useRef } from 'react'
import { Download, FileText, Eye, Edit3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AISettingsDialog } from '@/components/ai-settings-dialog'
import { InvoiceForm } from '@/components/invoice-form'
import { InvoicePreview } from '@/components/invoice-preview'
import { InvoiceData, generateInvoiceNumber } from '@/lib/invoice-types'

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
  const [activeTab, setActiveTab] = useState('edit')
  const previewRef = useRef<HTMLDivElement>(null)

  const downloadPDF = async () => {
    if (!previewRef.current) return

    const html2canvas = (await import('html2canvas')).default
    const jsPDF = (await import('jspdf')).default

    const canvas = await html2canvas(previewRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width / 2, canvas.height / 2],
    })

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2)
    pdf.save(`${invoice.invoiceNumber || 'invoice'}.pdf`)
  }

  const downloadJSON = () => {
    const dataStr = JSON.stringify(invoice, null, 2)
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
        setInvoice(data)
      } catch {
        alert('Invalid JSON file')
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-neutral-900" />
              <h1 className="text-xl font-semibold text-neutral-900">Invoice Generator</h1>
              <span className="hidden sm:inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                AI Powered
              </span>
            </div>

            <div className="flex items-center gap-2">
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
              <InvoiceForm invoice={invoice} onChange={setInvoice} />
            </TabsContent>
            <TabsContent value="preview">
              <div className="overflow-auto">
                <InvoicePreview ref={previewRef} invoice={invoice} />
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
            <InvoiceForm invoice={invoice} onChange={setInvoice} />
          </div>
          <div className="sticky top-24">
            <h2 className="text-sm font-medium text-neutral-500 mb-4 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </h2>
            <div className="overflow-auto max-h-[calc(100vh-8rem)] rounded-lg border bg-neutral-100 p-4">
              <InvoicePreview ref={previewRef} invoice={invoice} />
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
            <p><strong>3. Configure:</strong> Click the settings icon (⚙️) above to configure your AI provider. Ollama runs on <code className="px-1.5 py-0.5 bg-neutral-100 rounded text-xs">http://localhost:11434</code> by default.</p>
            <p><strong>4. Start creating:</strong> Use the ✨ buttons to get AI-powered suggestions for descriptions, pricing, and notes!</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
