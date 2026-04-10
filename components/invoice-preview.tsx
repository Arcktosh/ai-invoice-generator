'use client'

import { forwardRef } from 'react'
import {
  InvoiceData,
  formatCurrency,
  formatDate,
  calculateInvoiceTotals,
} from '@/lib/invoice-types'
import { InvoiceTemplate } from '@/lib/template-types'

interface InvoicePreviewProps {
  invoice: InvoiceData
  template: InvoiceTemplate
}

function getFontFamily(fontStyle: InvoiceTemplate['fontStyle']) {
  switch (fontStyle) {
    case 'mono':   return "'Courier New', ui-monospace, monospace"
    case 'serif':  return "Georgia, 'Times New Roman', serif"
    default:       return "system-ui, -apple-system, sans-serif"
  }
}

function ItemsTable({
  invoice,
  template,
}: {
  invoice: InvoiceData
  template: InvoiceTemplate
}) {
  const { subtotal, tax, total } = calculateInvoiceTotals(invoice.items, invoice.taxRate)
  return (
    <div className="mb-8">
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${template.accentColor}` }}>
            {['Description', 'Qty', 'Price', 'Amount'].map((h, i) => (
              <th
                key={h}
                style={{
                  padding: '10px 0',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: template.accentColor,
                  textAlign: i === 0 ? 'left' : 'right',
                  width: i === 0 ? 'auto' : i === 1 ? '60px' : '90px',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {invoice.items.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                style={{ padding: '32px 0', textAlign: 'center', color: template.mutedColor, fontSize: '13px' }}
              >
                No items added yet
              </td>
            </tr>
          ) : (
            invoice.items.map((item, idx) => (
              <tr
                key={item.id}
                style={{ borderBottom: `1px solid ${template.accentColor}18` }}
              >
                <td style={{ padding: '10px 0', fontSize: '13px', color: template.textColor }}>{item.description || '—'}</td>
                <td style={{ padding: '10px 0', fontSize: '13px', color: template.mutedColor, textAlign: 'right' }}>{item.quantity}</td>
                <td style={{ padding: '10px 0', fontSize: '13px', color: template.mutedColor, textAlign: 'right' }}>{formatCurrency(item.unitPrice)}</td>
                <td style={{ padding: '10px 0', fontSize: '13px', fontWeight: 600, color: template.textColor, textAlign: 'right' }}>
                  {formatCurrency(item.quantity * item.unitPrice)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
        <div style={{ width: '220px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}>
            <span style={{ color: template.mutedColor }}>Subtotal</span>
            <span style={{ fontWeight: 500, color: template.textColor }}>{formatCurrency(subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}>
            <span style={{ color: template.mutedColor }}>Tax ({invoice.taxRate}%)</span>
            <span style={{ fontWeight: 500, color: template.textColor }}>{formatCurrency(tax)}</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '10px 12px',
            marginTop: '6px',
            borderRadius: '6px',
            backgroundColor: template.accentColor,
          }}>
            <span style={{ fontWeight: 700, color: '#fff', fontSize: '14px' }}>Total Due</span>
            <span style={{ fontWeight: 700, color: '#fff', fontSize: '14px' }}>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function NotesSection({ invoice, template }: { invoice: InvoiceData; template: InvoiceTemplate }) {
  const terms = invoice.paymentTerms || template.defaultPaymentTerms
  const notes = invoice.notes || template.defaultNotes
  if (!terms && !notes) return null
  return (
    <div style={{ borderTop: `1px solid ${template.accentColor}30`, paddingTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      {terms && (
        <div>
          <p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: template.accentColor, marginBottom: '6px' }}>
            Payment Terms
          </p>
          <p style={{ fontSize: '12px', color: template.mutedColor, whiteSpace: 'pre-line' }}>{terms}</p>
        </div>
      )}
      {notes && (
        <div>
          <p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: template.accentColor, marginBottom: '6px' }}>
            Notes
          </p>
          <p style={{ fontSize: '12px', color: template.mutedColor, whiteSpace: 'pre-line' }}>{notes}</p>
        </div>
      )}
    </div>
  )
}

// ─── Layout: Classic ────────────────────────────────────────────────────────

function ClassicLayout({ invoice, template, fontFamily }: { invoice: InvoiceData; template: InvoiceTemplate; fontFamily: string }) {
  const sender = template.companyName || invoice.senderName
  const senderEmail = template.companyEmail || invoice.senderEmail
  const senderAddress = template.companyAddress || invoice.senderAddress

  return (
    <div style={{ padding: '48px', minHeight: '842px', fontFamily, backgroundColor: template.backgroundColor, color: template.textColor }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '36px' }}>
        <div>
          {sender && (
            <div style={{ fontSize: '20px', fontWeight: 700, color: template.accentColor }}>{sender}</div>
          )}
          {template.companyTagline && (
            <div style={{ fontSize: '12px', color: template.mutedColor, marginTop: '2px' }}>{template.companyTagline}</div>
          )}
          <div style={{ fontSize: '28px', fontWeight: 800, color: template.textColor, marginTop: '8px', letterSpacing: '-0.5px' }}>INVOICE</div>
          <div style={{ fontSize: '13px', color: template.mutedColor, marginTop: '2px' }}>{invoice.invoiceNumber}</div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '13px' }}>
          <div style={{ color: template.mutedColor }}>Issue Date</div>
          <div style={{ fontWeight: 500, color: template.textColor }}>{formatDate(invoice.issueDate)}</div>
          <div style={{ color: template.mutedColor, marginTop: '8px' }}>Due Date</div>
          <div style={{ fontWeight: 600, color: template.accentColor }}>{formatDate(invoice.dueDate)}</div>
        </div>
      </div>

      <div style={{ height: '2px', backgroundColor: template.accentColor, marginBottom: '28px' }} />

      {/* From / Bill To */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <div>
          <p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: template.accentColor, marginBottom: '6px' }}>From</p>
          <p style={{ fontWeight: 600, color: template.textColor }}>{sender || '—'}</p>
          {senderEmail && <p style={{ fontSize: '12px', color: template.mutedColor }}>{senderEmail}</p>}
          {template.companyPhone && <p style={{ fontSize: '12px', color: template.mutedColor }}>{template.companyPhone}</p>}
          {template.companyWebsite && <p style={{ fontSize: '12px', color: template.mutedColor }}>{template.companyWebsite}</p>}
          {senderAddress && <p style={{ fontSize: '12px', color: template.mutedColor, whiteSpace: 'pre-line' }}>{senderAddress}</p>}
        </div>
        <div>
          <p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: template.accentColor, marginBottom: '6px' }}>Bill To</p>
          <p style={{ fontWeight: 600, color: template.textColor }}>{invoice.clientName || '—'}</p>
          {invoice.clientEmail && <p style={{ fontSize: '12px', color: template.mutedColor }}>{invoice.clientEmail}</p>}
          {invoice.clientAddress && <p style={{ fontSize: '12px', color: template.mutedColor, whiteSpace: 'pre-line' }}>{invoice.clientAddress}</p>}
        </div>
      </div>

      <ItemsTable invoice={invoice} template={template} />
      <NotesSection invoice={invoice} template={template} />
      {template.footerText && (
        <p style={{ textAlign: 'center', fontSize: '11px', color: template.mutedColor, marginTop: '32px' }}>
          {template.footerText}
        </p>
      )}
    </div>
  )
}

// ─── Layout: Modern ─────────────────────────────────────────────────────────

function ModernLayout({ invoice, template, fontFamily }: { invoice: InvoiceData; template: InvoiceTemplate; fontFamily: string }) {
  const sender = template.companyName || invoice.senderName
  const senderEmail = template.companyEmail || invoice.senderEmail
  const senderAddress = template.companyAddress || invoice.senderAddress

  return (
    <div style={{ display: 'flex', minHeight: '842px', fontFamily, backgroundColor: template.backgroundColor, color: template.textColor }}>
      {/* Accent stripe */}
      <div style={{ width: '8px', backgroundColor: template.accentColor, flexShrink: 0 }} />

      <div style={{ flex: 1, padding: '48px 48px 48px 40px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '36px' }}>
          <div>
            <div style={{ fontSize: '36px', fontWeight: 900, color: template.accentColor, letterSpacing: '-1px' }}>INVOICE</div>
            <div style={{ fontSize: '13px', color: template.mutedColor, marginTop: '2px' }}>{invoice.invoiceNumber}</div>
            {sender && <div style={{ fontSize: '15px', fontWeight: 600, color: template.textColor, marginTop: '8px' }}>{sender}</div>}
            {template.companyTagline && <div style={{ fontSize: '12px', color: template.mutedColor }}>{template.companyTagline}</div>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ padding: '12px 16px', backgroundColor: template.accentColor + '12', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: template.mutedColor }}>Issue Date</div>
              <div style={{ fontWeight: 600, color: template.textColor, fontSize: '13px' }}>{formatDate(invoice.issueDate)}</div>
              <div style={{ fontSize: '11px', color: template.mutedColor, marginTop: '6px' }}>Due Date</div>
              <div style={{ fontWeight: 700, color: template.accentColor, fontSize: '13px' }}>{formatDate(invoice.dueDate)}</div>
            </div>
          </div>
        </div>

        {/* From / To */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
          <div style={{ borderLeft: `3px solid ${template.accentColor}`, paddingLeft: '12px' }}>
            <p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: template.accentColor, marginBottom: '6px' }}>From</p>
            <p style={{ fontWeight: 600, color: template.textColor }}>{sender || '—'}</p>
            {senderEmail && <p style={{ fontSize: '12px', color: template.mutedColor }}>{senderEmail}</p>}
            {template.companyPhone && <p style={{ fontSize: '12px', color: template.mutedColor }}>{template.companyPhone}</p>}
            {template.companyWebsite && <p style={{ fontSize: '12px', color: template.mutedColor }}>{template.companyWebsite}</p>}
            {senderAddress && <p style={{ fontSize: '12px', color: template.mutedColor, whiteSpace: 'pre-line' }}>{senderAddress}</p>}
          </div>
          <div style={{ borderLeft: `3px solid ${template.accentColor}40`, paddingLeft: '12px' }}>
            <p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: template.accentColor, marginBottom: '6px' }}>Bill To</p>
            <p style={{ fontWeight: 600, color: template.textColor }}>{invoice.clientName || '—'}</p>
            {invoice.clientEmail && <p style={{ fontSize: '12px', color: template.mutedColor }}>{invoice.clientEmail}</p>}
            {invoice.clientAddress && <p style={{ fontSize: '12px', color: template.mutedColor, whiteSpace: 'pre-line' }}>{invoice.clientAddress}</p>}
          </div>
        </div>

        <ItemsTable invoice={invoice} template={template} />
        <NotesSection invoice={invoice} template={template} />
        {template.footerText && (
          <p style={{ textAlign: 'center', fontSize: '11px', color: template.mutedColor, marginTop: '32px' }}>
            {template.footerText}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Layout: Bold ───────────────────────────────────────────────────────────

function BoldLayout({ invoice, template, fontFamily }: { invoice: InvoiceData; template: InvoiceTemplate; fontFamily: string }) {
  const sender = template.companyName || invoice.senderName
  const senderEmail = template.companyEmail || invoice.senderEmail
  const senderAddress = template.companyAddress || invoice.senderAddress

  return (
    <div style={{ minHeight: '842px', fontFamily, backgroundColor: template.backgroundColor, color: template.textColor }}>
      {/* Full-color header block */}
      <div style={{ backgroundColor: template.accentColor, padding: '36px 48px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            {sender && <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>{sender}</div>}
            {template.companyTagline && <div style={{ fontSize: '12px', color: '#ffffff90', marginTop: '2px' }}>{template.companyTagline}</div>}
            {senderEmail && <div style={{ fontSize: '12px', color: '#ffffff80', marginTop: '4px' }}>{senderEmail}</div>}
            {template.companyPhone && <div style={{ fontSize: '12px', color: '#ffffff80' }}>{template.companyPhone}</div>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '40px', fontWeight: 900, color: '#fff', letterSpacing: '-2px', lineHeight: 1 }}>INVOICE</div>
            <div style={{ fontSize: '13px', color: '#ffffff80', marginTop: '4px' }}>{invoice.invoiceNumber}</div>
          </div>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', gap: '32px' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#ffffff60', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Issue Date</div>
            <div style={{ fontSize: '13px', fontWeight: 500, color: '#fff' }}>{formatDate(invoice.issueDate)}</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#ffffff60', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Due Date</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{formatDate(invoice.dueDate)}</div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '36px 48px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: template.accentColor, marginBottom: '6px' }}>From</p>
            <p style={{ fontWeight: 600, color: template.textColor }}>{sender || '—'}</p>
            {senderAddress && <p style={{ fontSize: '12px', color: template.mutedColor, whiteSpace: 'pre-line' }}>{senderAddress}</p>}
          </div>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: template.accentColor, marginBottom: '6px' }}>Bill To</p>
            <p style={{ fontWeight: 600, color: template.textColor }}>{invoice.clientName || '—'}</p>
            {invoice.clientEmail && <p style={{ fontSize: '12px', color: template.mutedColor }}>{invoice.clientEmail}</p>}
            {invoice.clientAddress && <p style={{ fontSize: '12px', color: template.mutedColor, whiteSpace: 'pre-line' }}>{invoice.clientAddress}</p>}
          </div>
        </div>

        <ItemsTable invoice={invoice} template={template} />
        <NotesSection invoice={invoice} template={template} />
        {template.footerText && (
          <p style={{ textAlign: 'center', fontSize: '11px', color: template.mutedColor, marginTop: '32px' }}>
            {template.footerText}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Layout: Compact ────────────────────────────────────────────────────────

function CompactLayout({ invoice, template, fontFamily }: { invoice: InvoiceData; template: InvoiceTemplate; fontFamily: string }) {
  const sender = template.companyName || invoice.senderName
  const senderEmail = template.companyEmail || invoice.senderEmail
  const senderAddress = template.companyAddress || invoice.senderAddress

  return (
    <div style={{ padding: '36px', minHeight: '842px', fontFamily, backgroundColor: template.backgroundColor, color: template.textColor }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <span style={{ fontSize: '22px', fontWeight: 800, color: template.textColor, letterSpacing: '-0.5px' }}>INVOICE</span>
        <span style={{ fontSize: '13px', color: template.mutedColor }}>{invoice.invoiceNumber}</span>
      </div>
      <div style={{ height: '2px', backgroundColor: template.accentColor, marginBottom: '16px' }} />

      {/* Meta row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '12px' }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          <div>
            <span style={{ color: template.mutedColor }}>Issued: </span>
            <span style={{ fontWeight: 500, color: template.textColor }}>{formatDate(invoice.issueDate)}</span>
          </div>
          <div>
            <span style={{ color: template.mutedColor }}>Due: </span>
            <span style={{ fontWeight: 600, color: template.accentColor }}>{formatDate(invoice.dueDate)}</span>
          </div>
        </div>
      </div>

      {/* From / To inline */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px', fontSize: '12px' }}>
        <div>
          <p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: template.accentColor, marginBottom: '4px' }}>From</p>
          <p style={{ fontWeight: 600, color: template.textColor }}>{sender || '—'}</p>
          {senderEmail && <p style={{ color: template.mutedColor }}>{senderEmail}</p>}
          {senderAddress && <p style={{ color: template.mutedColor, whiteSpace: 'pre-line' }}>{senderAddress}</p>}
        </div>
        <div>
          <p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: template.accentColor, marginBottom: '4px' }}>Bill To</p>
          <p style={{ fontWeight: 600, color: template.textColor }}>{invoice.clientName || '—'}</p>
          {invoice.clientEmail && <p style={{ color: template.mutedColor }}>{invoice.clientEmail}</p>}
          {invoice.clientAddress && <p style={{ color: template.mutedColor, whiteSpace: 'pre-line' }}>{invoice.clientAddress}</p>}
        </div>
      </div>

      <ItemsTable invoice={invoice} template={template} />
      <NotesSection invoice={invoice} template={template} />
      {template.footerText && (
        <p style={{ textAlign: 'center', fontSize: '11px', color: template.mutedColor, marginTop: '24px' }}>
          {template.footerText}
        </p>
      )}
    </div>
  )
}

// ─── Main export ────────────────────────────────────────────────────────────

export const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(
  function InvoicePreview({ invoice, template }, ref) {
    const fontFamily = getFontFamily(template.fontStyle)

    return (
      <div ref={ref} style={{ backgroundColor: template.backgroundColor }}>
        {template.layout === 'modern' && (
          <ModernLayout invoice={invoice} template={template} fontFamily={fontFamily} />
        )}
        {template.layout === 'bold' && (
          <BoldLayout invoice={invoice} template={template} fontFamily={fontFamily} />
        )}
        {template.layout === 'compact' && (
          <CompactLayout invoice={invoice} template={template} fontFamily={fontFamily} />
        )}
        {(template.layout === 'classic' || !template.layout) && (
          <ClassicLayout invoice={invoice} template={template} fontFamily={fontFamily} />
        )}
      </div>
    )
  }
)
