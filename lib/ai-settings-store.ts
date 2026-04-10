'use client'

import { AISettings, defaultAISettings } from './invoice-types'

const STORAGE_KEY = 'invoice-ai-settings'

export function getAISettings(): AISettings {
  if (typeof window === 'undefined') return defaultAISettings
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Ignore parsing errors
  }
  return defaultAISettings
}

export function saveAISettings(settings: AISettings): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}
