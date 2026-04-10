'use client'

import { forwardRef } from 'react'
import {
  InvoiceData,
  formatCurrency,
  formatDate,
  calculateInvoiceTotals,
} from '@/lib/invoice-types'

interface InvoicePreviewProps {
  invoice: InvoiceData
}

export const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(
  function InvoicePreview({ invoice }, ref) {
    const { subtotal, tax, total } = calculateInvoiceTotals(invoice.items, invoice.taxRate)

    return (
      <div
        ref={ref}
        className="bg-white text-black p-8 min-h-[842px] w-full max-w-[595px] mx-auto shadow-lg"
        style={{ fontFamily: 'system-ui, sans-serif' }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">INVOICE</h1>
            <p className="text-neutral-500 mt-1">{invoice.invoiceNumber}</p>
          </div>
          <div className="text-right text-sm">
            <p className="text-neutral-500">Issue Date</p>
            <p className="font-medium">{formatDate(invoice.issueDate)}</p>
            <p className="text-neutral-500 mt-2">Due Date</p>
            <p className="font-medium">{formatDate(invoice.dueDate)}</p>
          </div>
        </div>

        {/* From / To */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">From</p>
            <p className="font-semibold text-neutral-900">{invoice.senderName || '—'}</p>
            <p className="text-sm text-neutral-600">{invoice.senderEmail}</p>
            <p className="text-sm text-neutral-600 whitespace-pre-line">{invoice.senderAddress}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Bill To</p>
            <p className="font-semibold text-neutral-900">{invoice.clientName || '—'}</p>
            <p className="text-sm text-neutral-600">{invoice.clientEmail}</p>
            <p className="text-sm text-neutral-600 whitespace-pre-line">{invoice.clientAddress}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-neutral-200">
                <th className="text-left py-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Description</th>
                <th className="text-right py-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider w-20">Qty</th>
                <th className="text-right py-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider w-24">Price</th>
                <th className="text-right py-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider w-28">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-neutral-400 text-sm">
                    No items added yet
                  </td>
                </tr>
              ) : (
                invoice.items.map((item) => (
                  <tr key={item.id} className="border-b border-neutral-100">
                    <td className="py-3 text-sm text-neutral-700">{item.description || '—'}</td>
                    <td className="py-3 text-sm text-right text-neutral-600">{item.quantity}</td>
                    <td className="py-3 text-sm text-right text-neutral-600">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-3 text-sm text-right font-medium text-neutral-900">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-2 text-sm">
              <span className="text-neutral-500">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between py-2 text-sm">
              <span className="text-neutral-500">Tax ({invoice.taxRate}%)</span>
              <span className="font-medium">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between py-3 border-t-2 border-neutral-900">
              <span className="font-bold text-neutral-900">Total Due</span>
              <span className="font-bold text-lg">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        {(invoice.paymentTerms || invoice.notes) && (
          <div className="border-t border-neutral-200 pt-6 grid gap-4 grid-cols-2">
            {invoice.paymentTerms && (
              <div>
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Payment Terms</p>
                <p className="text-sm text-neutral-600 whitespace-pre-line">{invoice.paymentTerms}</p>
              </div>
            )}
            {invoice.notes && (
              <div>
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Notes</p>
                <p className="text-sm text-neutral-600 whitespace-pre-line">{invoice.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-8">
          <p className="text-center text-xs text-neutral-400">
            Thank you for your business
          </p>
        </div>
      </div>
    )
  }
)
