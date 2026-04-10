export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  address: string
  company?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export function createCustomer(data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Customer {
  const now = new Date().toISOString()
  return {
    ...data,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  }
}

export function updateCustomer(customer: Customer, data: Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>): Customer {
  return {
    ...customer,
    ...data,
    updatedAt: new Date().toISOString(),
  }
}
