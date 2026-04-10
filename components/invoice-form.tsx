'use client'

import { useState } from 'react'
import { Plus, Trash2, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  InvoiceData,
  InvoiceItem,
  AISettings,
  generateInvoiceNumber,
  formatCurrency,
  calculateInvoiceTotals,
} from '@/lib/invoice-types'
import { getAISettings } from '@/lib/ai-settings-store'

interface InvoiceFormProps {
  invoice: InvoiceData
  onChange: (invoice: InvoiceData) => void
  templateName?: string
}

export function InvoiceForm({ invoice, onChange, templateName }: InvoiceFormProps) {
  const [aiLoading, setAiLoading] = useState<string | null>(null)

  const updateField = <K extends keyof InvoiceData>(field: K, value: InvoiceData[K]) => {
    onChange({ ...invoice, [field]: value })
  }

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      unitPrice: 0,
    }
    updateField('items', [...invoice.items, newItem])
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    updateField(
      'items',
      invoice.items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  const removeItem = (id: string) => {
    updateField('items', invoice.items.filter(item => item.id !== id))
  }

  const enhanceDescription = async (itemId: string) => {
    const item = invoice.items.find(i => i.id === itemId)
    if (!item || !item.description.trim()) return

    setAiLoading(itemId)
    try {
      const settings = getAISettings()
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'enhance-description',
          context: {
            description: item.description,
            clientIndustry: invoice.clientName,
          },
          settings,
        }),
      })

      const result = await response.json()
      if (result.success && result.data) {
        updateItem(itemId, 'description', result.data.description)
        if (item.unitPrice === 0 && result.data.suggestedPrice) {
          updateItem(itemId, 'unitPrice', result.data.suggestedPrice)
        }
      }
    } catch (error) {
      console.error('[AI Enhancement Error]', error)
    } finally {
      setAiLoading(null)
    }
  }

  const generateNotes = async () => {
    setAiLoading('notes')
    try {
      const settings = getAISettings()
      const { total } = calculateInvoiceTotals(invoice.items, invoice.taxRate)
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'generate-notes',
          context: {
            clientName: invoice.clientName,
            total: formatCurrency(total),
            serviceDescription: invoice.items.map(i => i.description).join(', '),
            dueDays: Math.round(
              (new Date(invoice.dueDate).getTime() - new Date(invoice.issueDate).getTime()) / 
              (1000 * 60 * 60 * 24)
            ),
          },
          settings,
        }),
      })

      const result = await response.json()
      if (result.success && result.data) {
        updateField('paymentTerms', result.data.paymentTerms)
        updateField('notes', result.data.notes)
      }
    } catch (error) {
      console.error('[AI Notes Generation Error]', error)
    } finally {
      setAiLoading(null)
    }
  }

  const suggestItems = async () => {
    setAiLoading('suggest')
    try {
      const settings = getAISettings()
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'suggest-items',
          context: {
            projectDescription: invoice.notes || 'General professional services',
            clientIndustry: invoice.clientName,
          },
          settings,
        }),
      })

      const result = await response.json()
      if (result.success && result.data?.items) {
        const newItems: InvoiceItem[] = result.data.items.map((item: { description: string; suggestedQuantity: number; suggestedPrice: number }) => ({
          id: crypto.randomUUID(),
          description: item.description,
          quantity: item.suggestedQuantity || 1,
          unitPrice: item.suggestedPrice || 0,
        }))
        updateField('items', [...invoice.items, ...newItems])
      }
    } catch (error) {
      console.error('[AI Suggestion Error]', error)
    } finally {
      setAiLoading(null)
    }
  }

  const { subtotal, tax, total } = calculateInvoiceTotals(invoice.items, invoice.taxRate)

  return (
    <div className="space-y-6">
      {/* Invoice Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <div className="flex gap-2">
              <Input
                id="invoiceNumber"
                value={invoice.invoiceNumber}
                onChange={(e) => updateField('invoiceNumber', e.target.value)}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateField('invoiceNumber', generateInvoiceNumber())}
                title="Generate new number"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="issueDate">Issue Date</Label>
            <Input
              id="issueDate"
              type="date"
              value={invoice.issueDate}
              onChange={(e) => updateField('issueDate', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={invoice.dueDate}
              onChange={(e) => updateField('dueDate', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sender & Client */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">From (Your Details)</CardTitle>
            {templateName && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {templateName}
              </span>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="senderName">Name / Company</Label>
              <Input
                id="senderName"
                value={invoice.senderName}
                onChange={(e) => updateField('senderName', e.target.value)}
                placeholder="Your Name or Company"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senderEmail">Email</Label>
              <Input
                id="senderEmail"
                type="email"
                value={invoice.senderEmail}
                onChange={(e) => updateField('senderEmail', e.target.value)}
                placeholder="your@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senderAddress">Address</Label>
              <Textarea
                id="senderAddress"
                value={invoice.senderAddress}
                onChange={(e) => updateField('senderAddress', e.target.value)}
                placeholder="123 Street, City, Country"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bill To (Client)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Name / Company</Label>
              <Input
                id="clientName"
                value={invoice.clientName}
                onChange={(e) => updateField('clientName', e.target.value)}
                placeholder="Client Name or Company"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientEmail">Email</Label>
              <Input
                id="clientEmail"
                type="email"
                value={invoice.clientEmail}
                onChange={(e) => updateField('clientEmail', e.target.value)}
                placeholder="client@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientAddress">Address</Label>
              <Textarea
                id="clientAddress"
                value={invoice.clientAddress}
                onChange={(e) => updateField('clientAddress', e.target.value)}
                placeholder="123 Street, City, Country"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Line Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Line Items</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={suggestItems}
              disabled={aiLoading === 'suggest'}
            >
              {aiLoading === 'suggest' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              AI Suggest
            </Button>
            <Button variant="outline" size="sm" onClick={addItem}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {invoice.items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No items yet. Click &quot;Add Item&quot; or &quot;AI Suggest&quot; to get started.
            </div>
          ) : (
            <>
              <div className="hidden md:grid md:grid-cols-[1fr_100px_120px_120px_40px] gap-2 text-sm font-medium text-muted-foreground">
                <div>Description</div>
                <div>Quantity</div>
                <div>Unit Price</div>
                <div>Amount</div>
                <div></div>
              </div>
              {invoice.items.map((item) => (
                <div key={item.id} className="grid gap-2 md:grid-cols-[1fr_100px_120px_120px_40px] items-start">
                  <div className="flex gap-2">
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Item description"
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => enhanceDescription(item.id)}
                      disabled={aiLoading === item.id || !item.description.trim()}
                      title="Enhance with AI"
                    >
                      {aiLoading === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                  />
                  <div className="flex items-center h-10 px-3 text-sm font-medium">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </>
          )}

          <Separator />

          {/* Totals */}
          <div className="flex flex-col items-end gap-2">
            <div className="grid grid-cols-2 gap-4 text-sm w-64">
              <div className="text-muted-foreground">Subtotal</div>
              <div className="text-right font-medium">{formatCurrency(subtotal)}</div>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                Tax
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={invoice.taxRate}
                  onChange={(e) => updateField('taxRate', parseFloat(e.target.value) || 0)}
                  className="h-7 w-16 text-xs"
                />
                %
              </div>
              <div className="text-right font-medium">{formatCurrency(tax)}</div>
              
              <Separator className="col-span-2" />
              
              <div className="text-base font-semibold">Total</div>
              <div className="text-right text-base font-bold">{formatCurrency(total)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes & Terms */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Notes & Payment Terms</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={generateNotes}
            disabled={aiLoading === 'notes'}
          >
            {aiLoading === 'notes' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            AI Generate
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="paymentTerms">Payment Terms</Label>
            <Textarea
              id="paymentTerms"
              value={invoice.paymentTerms || ''}
              onChange={(e) => updateField('paymentTerms', e.target.value)}
              placeholder="e.g., Net 30, Payment due upon receipt..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={invoice.notes || ''}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Additional notes or thank you message..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
