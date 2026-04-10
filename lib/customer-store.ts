import { Customer } from './customer-types'

const STORAGE_KEY = 'invoice-generator-customers'

export function getCustomers(): Customer[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveCustomers(customers: Customer[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers))
}

export function addCustomer(customer: Customer): void {
  const customers = getCustomers()
  customers.push(customer)
  saveCustomers(customers)
}

export function updateCustomerInStore(customer: Customer): void {
  const customers = getCustomers()
  const index = customers.findIndex(c => c.id === customer.id)
  if (index !== -1) {
    customers[index] = customer
    saveCustomers(customers)
  }
}

export function deleteCustomer(id: string): void {
  const customers = getCustomers().filter(c => c.id !== id)
  saveCustomers(customers)
}

export function getCustomerById(id: string): Customer | undefined {
  return getCustomers().find(c => c.id === id)
}

export function exportCustomers(): string {
  return JSON.stringify(getCustomers(), null, 2)
}

export function importCustomers(jsonString: string): { success: boolean; count: number; error?: string } {
  try {
    const imported = JSON.parse(jsonString)
    if (!Array.isArray(imported)) {
      return { success: false, count: 0, error: 'Invalid format: expected an array' }
    }
    
    const existing = getCustomers()
    const existingIds = new Set(existing.map(c => c.id))
    
    let addedCount = 0
    for (const item of imported) {
      if (item.id && item.name && item.email && !existingIds.has(item.id)) {
        existing.push(item as Customer)
        addedCount++
      }
    }
    
    saveCustomers(existing)
    return { success: true, count: addedCount }
  } catch {
    return { success: false, count: 0, error: 'Invalid JSON' }
  }
}
