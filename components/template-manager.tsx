'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Check, LayoutTemplate, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  InvoiceTemplate,
  PRESET_COLORS,
  LAYOUT_OPTIONS,
  TemplateFontStyle,
  createDefaultTemplate,
} from '@/lib/template-types'
import {
  getAllTemplates,
  saveCustomTemplate,
  deleteCustomTemplate,
  getActiveTemplateId,
  setActiveTemplateId,
} from '@/lib/template-store'

interface TemplateManagerProps {
  onTemplateChange: (template: InvoiceTemplate) => void
}

const FONT_OPTIONS: { value: TemplateFontStyle; label: string }[] = [
  { value: 'sans',  label: 'Sans-serif (Modern)' },
  { value: 'serif', label: 'Serif (Traditional)' },
  { value: 'mono',  label: 'Monospace (Technical)' },
]

function ColorSwatch({ color, selected, onClick }: { color: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{
        backgroundColor: color,
        borderColor: selected ? color : 'transparent',
        boxShadow: selected ? `0 0 0 2px white, 0 0 0 4px ${color}` : undefined,
      }}
      aria-label={`Color ${color}`}
    >
      {selected && (
        <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow" />
      )}
    </button>
  )
}

function TemplateEditorDialog({
  template,
  open,
  onOpenChange,
  onSave,
}: {
  template: InvoiceTemplate | null
  open: boolean
  onOpenChange: (v: boolean) => void
  onSave: (t: InvoiceTemplate) => void
}) {
  const isNew = !template
  const [form, setForm] = useState<InvoiceTemplate>(
    template ?? createDefaultTemplate()
  )

  useEffect(() => {
    setForm(template ?? createDefaultTemplate())
  }, [template, open])

  const set = <K extends keyof InvoiceTemplate>(key: K, value: InvoiceTemplate[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleSave = () => {
    const now = new Date().toISOString()
    onSave({ ...form, updatedAt: now })
    onOpenChange(false)
  }

  const selectedPreset = PRESET_COLORS.find(p => p.accent === form.accentColor)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? 'Create Template' : 'Edit Template'}</DialogTitle>
          <DialogDescription>
            Design your invoice template — layout, colors, branding, and default content.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Identity */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Template Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="tpl-name">Template Name</Label>
                <Input
                  id="tpl-name"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="e.g., Agency Invoice"
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="tpl-desc">Description</Label>
                <Input
                  id="tpl-desc"
                  value={form.description ?? ''}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Short description"
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* Branding */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Company Branding</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="co-name">Company Name</Label>
                <Input
                  id="co-name"
                  value={form.companyName}
                  onChange={e => set('companyName', e.target.value)}
                  placeholder="Acme Corp"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="co-tagline">Tagline</Label>
                <Input
                  id="co-tagline"
                  value={form.companyTagline ?? ''}
                  onChange={e => set('companyTagline', e.target.value)}
                  placeholder="We build great things"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="co-email">Email</Label>
                <Input
                  id="co-email"
                  type="email"
                  value={form.companyEmail ?? ''}
                  onChange={e => set('companyEmail', e.target.value)}
                  placeholder="hello@acme.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="co-phone">Phone</Label>
                <Input
                  id="co-phone"
                  value={form.companyPhone ?? ''}
                  onChange={e => set('companyPhone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="co-website">Website</Label>
                <Input
                  id="co-website"
                  value={form.companyWebsite ?? ''}
                  onChange={e => set('companyWebsite', e.target.value)}
                  placeholder="https://acme.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="co-addr">Address</Label>
                <Input
                  id="co-addr"
                  value={form.companyAddress ?? ''}
                  onChange={e => set('companyAddress', e.target.value)}
                  placeholder="123 Main St, City"
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* Design */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Design</h3>

            {/* Layout */}
            <div className="space-y-2">
              <Label>Layout Style</Label>
              <div className="grid grid-cols-2 gap-2">
                {LAYOUT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set('layout', opt.value)}
                    className={`relative rounded-lg border-2 p-3 text-left transition-colors ${
                      form.layout === opt.value
                        ? 'border-foreground bg-muted'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    {form.layout === opt.value && (
                      <Check className="absolute right-2 top-2 h-3.5 w-3.5 text-foreground" />
                    )}
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Color */}
            <div className="space-y-2">
              <Label>Accent Color</Label>
              <div className="flex items-center gap-3 flex-wrap">
                {PRESET_COLORS.map(preset => (
                  <ColorSwatch
                    key={preset.accent}
                    color={preset.accent}
                    selected={form.accentColor === preset.accent}
                    onClick={() => {
                      set('accentColor', preset.accent)
                      set('mutedColor', preset.muted)
                    }}
                  />
                ))}
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-sm text-muted-foreground">Custom:</span>
                  <input
                    type="color"
                    value={form.accentColor}
                    onChange={e => set('accentColor', e.target.value)}
                    className="h-8 w-10 cursor-pointer rounded border border-border bg-transparent p-0.5"
                    title="Pick accent color"
                  />
                </div>
              </div>
              {selectedPreset && (
                <p className="text-xs text-muted-foreground">{selectedPreset.label} palette selected</p>
              )}
            </div>

            {/* Font */}
            <div className="space-y-1.5">
              <Label htmlFor="font-style">Font Style</Label>
              <Select
                value={form.fontStyle}
                onValueChange={v => set('fontStyle', v as TemplateFontStyle)}
              >
                <SelectTrigger id="font-style">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map(f => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Live preview swatch */}
            <div
              className="rounded-lg p-4 border text-sm"
              style={{
                backgroundColor: form.backgroundColor,
                color: form.textColor,
                borderColor: form.accentColor + '40',
                fontFamily: form.fontStyle === 'mono'
                  ? 'ui-monospace, monospace'
                  : form.fontStyle === 'serif'
                    ? 'Georgia, serif'
                    : 'system-ui, sans-serif',
              }}
            >
              <div
                className="text-xs font-semibold uppercase tracking-widest mb-1"
                style={{ color: form.accentColor }}
              >
                {form.companyName || 'Your Company'}
              </div>
              <div className="font-bold text-base">INVOICE</div>
              <div className="mt-2 text-xs" style={{ color: form.mutedColor }}>
                {form.layout === 'bold' ? 'Bold header style' :
                 form.layout === 'modern' ? 'Modern accent stripe' :
                 form.layout === 'compact' ? 'Compact layout' : 'Classic professional'}
              </div>
              <div
                className="mt-3 h-px"
                style={{ backgroundColor: form.accentColor }}
              />
              <div className="mt-2 text-xs" style={{ color: form.mutedColor }}>
                Item description · Qty · Price · Amount
              </div>
            </div>
          </section>

          <Separator />

          {/* Content Defaults */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Default Content</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="def-tax">Default Tax Rate (%)</Label>
                <Input
                  id="def-tax"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={form.defaultTaxRate}
                  onChange={e => set('defaultTaxRate', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="footer-text">Footer Text</Label>
                <Input
                  id="footer-text"
                  value={form.footerText ?? ''}
                  onChange={e => set('footerText', e.target.value)}
                  placeholder="Thank you for your business."
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="def-terms">Default Payment Terms</Label>
                <Textarea
                  id="def-terms"
                  rows={2}
                  value={form.defaultPaymentTerms ?? ''}
                  onChange={e => set('defaultPaymentTerms', e.target.value)}
                  placeholder="Net 30. Payment due within 30 days of invoice date."
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="def-notes">Default Notes</Label>
                <Textarea
                  id="def-notes"
                  rows={2}
                  value={form.defaultNotes ?? ''}
                  onChange={e => set('defaultNotes', e.target.value)}
                  placeholder="Thank you for choosing us. We look forward to working with you again."
                />
              </div>
            </div>
          </section>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!form.name.trim()}>
            {isNew ? 'Create Template' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function TemplateManager({ onTemplateChange }: TemplateManagerProps) {
  const [open, setOpen] = useState(false)
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([])
  const [activeId, setActiveId] = useState<string>('builtin-classic')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<InvoiceTemplate | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<InvoiceTemplate | null>(null)

  useEffect(() => {
    if (open) {
      setTemplates(getAllTemplates())
      setActiveId(getActiveTemplateId())
    }
  }, [open])

  const handleApply = (template: InvoiceTemplate) => {
    setActiveId(template.id)
    setActiveTemplateId(template.id)
    onTemplateChange(template)
    setOpen(false)
  }

  const handleSave = (template: InvoiceTemplate) => {
    saveCustomTemplate(template)
    const updated = getAllTemplates()
    setTemplates(updated)
    // If this was the active template, re-apply it so the preview updates
    if (template.id === activeId) {
      onTemplateChange(template)
    }
  }

  const handleDelete = (template: InvoiceTemplate) => {
    deleteCustomTemplate(template.id)
    const updated = getAllTemplates()
    setTemplates(updated)
    if (template.id === activeId) {
      const fallback = updated[0]
      setActiveId(fallback.id)
      setActiveTemplateId(fallback.id)
      onTemplateChange(fallback)
    }
  }

  const handleDuplicate = (template: InvoiceTemplate) => {
    const now = new Date().toISOString()
    const copy: InvoiceTemplate = {
      ...template,
      id: crypto.randomUUID(),
      name: `${template.name} (Copy)`,
      createdAt: now,
      updatedAt: now,
    }
    saveCustomTemplate(copy)
    setTemplates(getAllTemplates())
  }

  const builtIn = templates.filter(t => t.id.startsWith('builtin-'))
  const custom = templates.filter(t => !t.id.startsWith('builtin-'))

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <LayoutTemplate className="mr-2 h-4 w-4" />
            Templates
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Templates</DialogTitle>
            <DialogDescription>
              Choose a template to apply or create your own branded design.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Built-in */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Built-in Templates
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {builtIn.map(template => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isActive={template.id === activeId}
                    isBuiltIn
                    onApply={() => handleApply(template)}
                    onEdit={() => { setEditingTemplate(template); setEditorOpen(true) }}
                    onDuplicate={() => handleDuplicate(template)}
                    onDelete={null}
                  />
                ))}
              </div>
            </div>

            {/* Custom */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  My Templates
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setEditingTemplate(null); setEditorOpen(true) }}
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  New
                </Button>
              </div>
              {custom.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No custom templates yet.
                  <br />
                  Click &quot;New&quot; to create your first branded template.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {custom.map(template => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      isActive={template.id === activeId}
                      isBuiltIn={false}
                      onApply={() => handleApply(template)}
                      onEdit={() => { setEditingTemplate(template); setEditorOpen(true) }}
                      onDuplicate={() => handleDuplicate(template)}
                      onDelete={() => setDeleteTarget(template)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Editor */}
      <TemplateEditorDialog
        template={editingTemplate}
        open={editorOpen}
        onOpenChange={setEditorOpen}
        onSave={handleSave}
      />

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) handleDelete(deleteTarget)
                setDeleteTarget(null)
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function TemplateCard({
  template,
  isActive,
  isBuiltIn,
  onApply,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  template: InvoiceTemplate
  isActive: boolean
  isBuiltIn: boolean
  onApply: () => void
  onEdit: () => void
  onDuplicate: () => void
  onDelete: (() => void) | null
}) {
  return (
    <div
      className={`relative rounded-lg border-2 overflow-hidden transition-colors ${
        isActive ? 'border-foreground' : 'border-border hover:border-muted-foreground'
      }`}
    >
      {/* Mini preview */}
      <div
        className="h-24 w-full relative p-3"
        style={{ backgroundColor: template.backgroundColor }}
      >
        {template.layout === 'bold' ? (
          <>
            <div
              className="absolute inset-x-0 top-0 h-10 flex items-center px-3"
              style={{ backgroundColor: template.accentColor }}
            >
              <span
                className="text-xs font-bold tracking-wide"
                style={{
                  color: '#fff',
                  fontFamily: template.fontStyle === 'mono' ? 'monospace' : template.fontStyle === 'serif' ? 'Georgia, serif' : 'system-ui',
                }}
              >
                {template.companyName || 'COMPANY'}
              </span>
            </div>
            <div className="mt-10 flex items-center justify-between">
              <span className="text-xs font-semibold" style={{ color: template.textColor }}>INVOICE</span>
              <div className="space-y-0.5 text-right">
                <div className="h-1 w-10 rounded" style={{ backgroundColor: template.accentColor + '50' }} />
                <div className="h-1 w-8 rounded" style={{ backgroundColor: template.accentColor + '30' }} />
              </div>
            </div>
          </>
        ) : template.layout === 'modern' ? (
          <div className="flex h-full gap-2">
            <div className="w-1 rounded-full" style={{ backgroundColor: template.accentColor }} />
            <div className="flex-1">
              <div className="text-xs font-bold" style={{ color: template.accentColor }}>INVOICE</div>
              <div className="text-xs mt-1" style={{ color: template.mutedColor }}>{template.companyName || 'Company'}</div>
              <div className="mt-2 space-y-0.5">
                <div className="h-1 w-full rounded" style={{ backgroundColor: template.accentColor + '20' }} />
                <div className="h-1 w-3/4 rounded" style={{ backgroundColor: template.accentColor + '15' }} />
              </div>
            </div>
          </div>
        ) : template.layout === 'compact' ? (
          <div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold" style={{ color: template.textColor }}>INVOICE</span>
              <span className="text-xs" style={{ color: template.mutedColor }}>#0001</span>
            </div>
            <div className="mt-1 h-px" style={{ backgroundColor: template.accentColor }} />
            <div className="mt-1.5 space-y-0.5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-1 rounded" style={{ backgroundColor: template.accentColor + (i === 0 ? '25' : '15'), width: `${80 - i * 15}%` }} />
              ))}
            </div>
          </div>
        ) : (
          // Classic
          <div>
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs font-bold" style={{ color: template.accentColor }}>{template.companyName || 'Company'}</div>
                <div className="text-xs mt-0.5" style={{ color: template.mutedColor }}>INVOICE</div>
              </div>
              <div className="text-right">
                <div className="h-1 w-8 rounded mb-0.5" style={{ backgroundColor: template.accentColor + '40' }} />
                <div className="h-1 w-6 rounded" style={{ backgroundColor: template.accentColor + '25' }} />
              </div>
            </div>
            <div className="mt-2 h-px" style={{ backgroundColor: template.accentColor + '40' }} />
            <div className="mt-1.5 space-y-0.5">
              <div className="h-1 w-full rounded" style={{ backgroundColor: template.accentColor + '20' }} />
              <div className="h-1 w-2/3 rounded" style={{ backgroundColor: template.accentColor + '12' }} />
            </div>
          </div>
        )}

        {isActive && (
          <div
            className="absolute top-2 right-2 h-5 w-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: template.accentColor }}
          >
            <Check className="h-3 w-3 text-white" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 bg-background border-t">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{template.name}</p>
            {template.description && (
              <p className="text-xs text-muted-foreground truncate">{template.description}</p>
            )}
          </div>
          {isBuiltIn && (
            <Badge variant="secondary" className="text-[10px] shrink-0">Built-in</Badge>
          )}
        </div>
        <div className="flex items-center gap-1 mt-2">
          <Button
            size="sm"
            variant={isActive ? 'default' : 'outline'}
            className="h-7 text-xs flex-1"
            onClick={onApply}
          >
            {isActive ? 'Applied' : 'Apply'}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 shrink-0"
            onClick={onEdit}
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 shrink-0"
            onClick={onDuplicate}
            title="Duplicate"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          {onDelete && (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
              onClick={onDelete}
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
