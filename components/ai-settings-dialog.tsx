'use client'

import { useState, useEffect } from 'react'
import { Settings, Check, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AISettings, defaultAISettings } from '@/lib/invoice-types'
import { getAISettings, saveAISettings } from '@/lib/ai-settings-store'

interface AISettingsDialogProps {
  onSettingsChange?: (settings: AISettings) => void
}

export function AISettingsDialog({ onSettingsChange }: AISettingsDialogProps) {
  const [open, setOpen] = useState(false)
  const [settings, setSettings] = useState<AISettings>(defaultAISettings)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)

  useEffect(() => {
    setSettings(getAISettings())
  }, [])

  const handleSave = () => {
    saveAISettings(settings)
    onSettingsChange?.(settings)
    setOpen(false)
  }

  const testConnection = async () => {
    setTesting(true)
    setTestResult(null)
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'enhance-description',
          context: { description: 'Test connection' },
          settings,
        }),
      })
      
      if (response.ok) {
        setTestResult('success')
      } else {
        setTestResult('error')
      }
    } catch {
      setTestResult('error')
    } finally {
      setTesting(false)
    }
  }

  const ollamaModels = ['llama3.2', 'llama3.1', 'mistral', 'codellama', 'phi3', 'gemma2']

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
          <span className="sr-only">AI Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>AI Configuration</DialogTitle>
          <DialogDescription>
            Configure your local AI provider for invoice generation assistance.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="provider">AI Provider</Label>
            <Select
              value={settings.provider}
              onValueChange={(value: AISettings['provider']) => 
                setSettings(prev => ({ ...prev, provider: value }))
              }
            >
              <SelectTrigger id="provider">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ollama">Ollama (Local)</SelectItem>
                <SelectItem value="openai-compatible">OpenAI Compatible API</SelectItem>
                <SelectItem value="vercel-gateway">Vercel AI Gateway</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {settings.provider !== 'vercel-gateway' && (
            <div className="grid gap-2">
              <Label htmlFor="baseUrl">Base URL</Label>
              <Input
                id="baseUrl"
                value={settings.baseUrl}
                onChange={(e) => setSettings(prev => ({ ...prev, baseUrl: e.target.value }))}
                placeholder={settings.provider === 'ollama' ? 'http://localhost:11434' : 'https://api.example.com/v1'}
              />
              {settings.provider === 'ollama' && (
                <p className="text-xs text-muted-foreground">
                  Default Ollama URL. Make sure Ollama is running locally.
                </p>
              )}
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="model">Model</Label>
            {settings.provider === 'ollama' ? (
              <Select
                value={settings.model}
                onValueChange={(value) => setSettings(prev => ({ ...prev, model: value }))}
              >
                <SelectTrigger id="model">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {ollamaModels.map(model => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="model"
                value={settings.model}
                onChange={(e) => setSettings(prev => ({ ...prev, model: e.target.value }))}
                placeholder={settings.provider === 'vercel-gateway' ? 'openai/gpt-4o-mini' : 'gpt-4o-mini'}
              />
            )}
          </div>

          {settings.provider === 'openai-compatible' && (
            <div className="grid gap-2">
              <Label htmlFor="apiKey">API Key (Optional)</Label>
              <Input
                id="apiKey"
                type="password"
                value={settings.apiKey || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="sk-..."
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={testConnection}
              disabled={testing}
            >
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Connection'
              )}
            </Button>
            {testResult === 'success' && (
              <span className="flex items-center text-sm text-green-600">
                <Check className="mr-1 h-4 w-4" />
                Connected
              </span>
            )}
            {testResult === 'error' && (
              <span className="flex items-center text-sm text-red-600">
                <AlertCircle className="mr-1 h-4 w-4" />
                Connection failed
              </span>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
