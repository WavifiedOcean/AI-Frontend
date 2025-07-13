import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Loader2, Code, Zap, Users, DollarSign, CheckCircle, AlertCircle, Copy, Download } from 'lucide-react'
import './App.css'

const API_BASE_URL = 'https://web-production-251e3.up.railway.app/api'

function App() {
  const [prompt, setPrompt] = useState('')
  const [scriptType, setScriptType] = useState('general')
  const [complexity, setComplexity] = useState('medium')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedScript, setGeneratedScript] = useState(null)
  const [error, setError] = useState(null)
  const [providers, setProviders] = useState([])
  const [templates, setTemplates] = useState([])
  const [activeTab, setActiveTab] = useState('generate')

  useEffect(() => {
    fetchProviders()
    fetchTemplates()
  }, [])

  const fetchProviders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/providers`)
      const data = await response.json()
      setProviders(data.providers || [])
    } catch (err) {
      console.error('Failed to fetch providers:', err)
    }
  }

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/templates`)
      const data = await response.json()
      setTemplates(data.templates || [])
    } catch (err) {
      console.error('Failed to fetch templates:', err)
    }
  }

  const generateScript = async () => {
    if (!prompt.trim()) {
      setError('Please enter a script description')
      return
    }

    setIsGenerating(true)
    setError(null)
    setGeneratedScript(null)

    try {
      const response = await fetch(`${API_BASE_URL}/ai/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          script_type: scriptType,
          complexity,
          user_tier: 'free'
        })
      })

      const data = await response.json()

      if (data.success) {
        setGeneratedScript(data)
      } else {
        setError(data.error || 'Failed to generate script')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const downloadScript = (code, filename = 'roblox_script.lua') => {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const useTemplate = (template) => {
    setPrompt(`Create a ${template.name.toLowerCase()} - ${template.description}`)
    setScriptType(template.category)
    setComplexity(template.complexity)
    setActiveTab('generate')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Wave AI Assistant
          </h1>
          <p className="text-lg text-gray-600">
            Generate powerful Lua scripts for Wave Roblox Executor using advanced AI
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="flex items-center p-4">
              <Code className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">AI Models</p>
                <p className="text-2xl font-bold text-gray-900">{providers.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-4">
              <Zap className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Generation</p>
                <p className="text-2xl font-bold text-gray-900">1.2s</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-4">
              <Users className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Exploit Scripts</p>
                <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-4">
              <DollarSign className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Cost/Script</p>
                <p className="text-2xl font-bold text-gray-900">$0.0008</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generate">Generate Script</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="providers">AI Providers</TabsTrigger>
          </TabsList>

          {/* Generate Script Tab */}
          <TabsContent value="generate" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Script Requirements</CardTitle>
                  <CardDescription>
                    Describe what you want your Wave Executor script to do
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Script Description
                    </label>
                    <Textarea
                      placeholder="e.g., Create an aimbot script for FPS games, auto-farm script for simulator games, speed hack for any game..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Script Type
                      </label>
                      <Select value={scriptType} onValueChange={setScriptType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="exploit">Exploit/Hack</SelectItem>
                          <SelectItem value="aimbot">Aimbot/ESP</SelectItem>
                          <SelectItem value="autofarm">Auto-Farm</SelectItem>
                          <SelectItem value="speed">Speed/Teleport</SelectItem>
                          <SelectItem value="gui">Custom GUI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Complexity
                      </label>
                      <Select value={complexity} onValueChange={setComplexity}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    onClick={generateScript} 
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Script...
                      </>
                    ) : (
                      <>
                        <Code className="mr-2 h-4 w-4" />
                        Generate Script
                      </>
                    )}
                  </Button>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Output Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Generated Script</CardTitle>
                  <CardDescription>
                    Your AI-generated Lua script for Wave Executor
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {generatedScript ? (
                    <div className="space-y-4">
                      {/* Metadata */}
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">
                          {generatedScript.metadata.provider}
                        </Badge>
                        <Badge variant="outline">
                          {generatedScript.metadata.model}
                        </Badge>
                        <Badge variant="outline">
                          {generatedScript.metadata.generation_time}s
                        </Badge>
                        <Badge variant="outline">
                          ${generatedScript.metadata.cost_estimate}
                        </Badge>
                      </div>

                      {/* Code */}
                      <div className="relative">
                        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{generatedScript.script.code}</code>
                        </pre>
                        <div className="absolute top-2 right-2 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(generatedScript.script.code)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadScript(generatedScript.script.code)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {generatedScript.metadata.fallback_used && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Primary provider was unavailable, fallback provider was used.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Generated script will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Script Templates</CardTitle>
                <CardDescription>
                  Pre-built templates for common Wave Executor scripts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{template.name}</h3>
                          <Badge variant={
                            template.complexity === 'easy' ? 'default' :
                            template.complexity === 'medium' ? 'secondary' : 'destructive'
                          }>
                            {template.complexity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline">{template.category}</Badge>
                          <Button size="sm" onClick={() => useTemplate(template)}>
                            Use Template
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Providers Tab */}
          <TabsContent value="providers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Providers</CardTitle>
                <CardDescription>
                  Available AI models and their capabilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {providers.map((provider) => (
                    <Card key={provider.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold flex items-center gap-2">
                              {provider.name}
                              <Badge variant={provider.status === 'available' ? 'default' : 'destructive'}>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {provider.status}
                              </Badge>
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Models: {provider.models.join(', ')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App

