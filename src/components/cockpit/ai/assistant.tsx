import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import {
  Bot,
  Sparkles,
  Square,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Plus,
  Trash2,
  History,
  Edit,
  Wifi,
  WifiOff,
  Paperclip,
  MoreHorizontal,
} from 'lucide-react'
import { toast } from 'sonner'
import type { ChatStatus } from 'ai'
import React, { useState, useCallback, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
} from '@/components/ui/conversation'
import { Toaster } from '@/components/ui/sonner'
import { Message, MessageContent } from '@/components/ui/message'
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputFooter,
  PromptInputTools,
  usePromptInputAttachments,
} from '@/components/ui/prompt-input'

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant' | 'activity'
  content: string
  feedback?: 'liked' | 'disliked' | undefined
}

// Export as Message for backward compatibility
export type Message = ChatMessage

export type ChatSession = {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
  threadId?: string
}

// AG-UI Context type from https://docs.ag-ui.com/sdk/js/core/types#context
export type Context = {
  description: string
  value: string
}

// Generic state type for flexible state management
export type State = Record<string, any>

// Tool definition type
export type Tool = {
  name: string
  description: string
  parameters: Record<string, any>
}

// Toast status type
export type ToastStatus = 'success' | 'error' | 'info' | 'warning'

// Action callbacks provided to action menu items
export type ActionCallbacks = {
  toast: (message: string, status: ToastStatus) => void
  setContext: (context: Context[]) => void
  getContext: () => Context[]
  setState: (state: State) => void
  getState: () => State
  setTool: (tool: Tool) => void
  getTools: () => Tool[]
  getMessages: () => ChatMessage[]
  addActivity: (content: string) => void
}

export type ActionMenuItem = {
  label: string
  icon?: string
  onClick: (callbacks: ActionCallbacks) => void
  disabled?: boolean
}

// Attachment button component that uses the prompt input context
const AttachmentButton = () => {
  const attachments = usePromptInputAttachments()

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-muted-foreground"
      onClick={() => attachments.openFileDialog()}
      title="Add attachments"
    >
      <Paperclip className="w-4 h-4" />
    </Button>
  )
}

// Agent/Team API client functions
const agentTeamApi = {
  // Agent endpoints
  async listAgents(agnoBaseURL: string): Promise<AgentResponse[]> {
    const response = await fetch(`${agnoBaseURL}/agents`)
    if (!response.ok) {
      throw new Error(`Failed to fetch agents: ${response.statusText}`)
    }
    return response.json()
  },

  async getAgentDetails(
    agnoBaseURL: string,
    agentId: string
  ): Promise<AgentResponse> {
    const response = await fetch(`${agnoBaseURL}/agents/${agentId}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch agent details: ${response.statusText}`)
    }
    return response.json()
  },

  async createAgentRun(
    agnoBaseURL: string,
    agentId: string,
    message: string,
    options: {
      sessionId?: string
      userId?: string
      stream?: boolean
      files?: File[]
      signal?: AbortSignal
    } = {}
  ): Promise<Response> {
    const formData = new FormData()
    formData.append('message', message)
    formData.append('stream', (options.stream ?? true).toString())

    if (options.sessionId) {
      formData.append('session_id', options.sessionId)
    }
    if (options.userId) {
      formData.append('user_id', options.userId)
    }
    if (options.files) {
      options.files.forEach(file => {
        formData.append('files', file)
      })
    }

    return fetch(`${agnoBaseURL}/agents/${agentId}/runs`, {
      method: 'POST',
      body: formData,
      ...(options.signal && { signal: options.signal }),
    })
  },

  async cancelAgentRun(
    agnoBaseURL: string,
    agentId: string,
    runId: string
  ): Promise<void> {
    const response = await fetch(
      `${agnoBaseURL}/agents/${agentId}/runs/${runId}/cancel`,
      {
        method: 'POST',
      }
    )
    if (!response.ok) {
      throw new Error(`Failed to cancel agent run: ${response.statusText}`)
    }
  },

  async continueAgentRun(
    agnoBaseURL: string,
    agentId: string,
    runId: string,
    tools: any,
    options: {
      sessionId?: string
      userId?: string
      stream?: boolean
    } = {}
  ): Promise<Response> {
    const params = new URLSearchParams()
    params.append('tools', JSON.stringify(tools))

    if (options.sessionId) {
      params.append('session_id', options.sessionId)
    }
    if (options.userId) {
      params.append('user_id', options.userId)
    }
    if (options.stream !== undefined) {
      params.append('stream', options.stream.toString())
    }

    return fetch(`${agnoBaseURL}/agents/${agentId}/runs/${runId}/continue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })
  },

  // Team endpoints
  async listTeams(agnoBaseURL: string): Promise<TeamResponse[]> {
    const response = await fetch(`${agnoBaseURL}/teams`)
    if (!response.ok) {
      throw new Error(`Failed to fetch teams: ${response.statusText}`)
    }
    return response.json()
  },

  async getTeamDetails(
    agnoBaseURL: string,
    teamId: string
  ): Promise<TeamResponse> {
    const response = await fetch(`${agnoBaseURL}/teams/${teamId}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch team details: ${response.statusText}`)
    }
    return response.json()
  },

  async createTeamRun(
    agnoBaseURL: string,
    teamId: string,
    message: string,
    options: {
      sessionId?: string
      userId?: string
      stream?: boolean
      monitor?: boolean
      files?: File[]
      signal?: AbortSignal
    } = {}
  ): Promise<Response> {
    const formData = new FormData()
    formData.append('message', message)
    formData.append('stream', (options.stream ?? true).toString())
    formData.append('monitor', (options.monitor ?? true).toString())

    if (options.sessionId) {
      formData.append('session_id', options.sessionId)
    }
    if (options.userId) {
      formData.append('user_id', options.userId)
    }
    if (options.files) {
      options.files.forEach(file => {
        formData.append('files', file)
      })
    }

    return fetch(`${agnoBaseURL}/teams/${teamId}/runs`, {
      method: 'POST',
      body: formData,
      ...(options.signal && { signal: options.signal }),
    })
  },

  async cancelTeamRun(
    agnoBaseURL: string,
    teamId: string,
    runId: string
  ): Promise<void> {
    const response = await fetch(
      `${agnoBaseURL}/teams/${teamId}/runs/${runId}/cancel`,
      {
        method: 'POST',
      }
    )
    if (!response.ok) {
      throw new Error(`Failed to cancel team run: ${response.statusText}`)
    }
  },
}

// Enhanced session manager with agent/team execution support
const sessionManager = {
  async getSessions(userId: string): Promise<ChatSession[]> {
    // For localStorage, retrieve sessions from browser storage
    try {
      const storageKey = userId
        ? `agui-chat-sessions-${userId}`
        : 'agui-chat-sessions'
      const storedSessions = localStorage.getItem(storageKey)
      if (storedSessions) {
        const parsedSessions: ChatSession[] = JSON.parse(storedSessions)
        return parsedSessions
      }
      return []
    } catch (error) {
      console.error('Failed to load sessions from localStorage:', error)
      return []
    }
  },

  async getSession(
    sessionId: string,
    userId: string
  ): Promise<ChatSession | null> {
    // For localStorage, find session in browser storage
    try {
      const storageKey = userId
        ? `agui-chat-sessions-${userId}`
        : 'agui-chat-sessions'
      const storedSessions = localStorage.getItem(storageKey)
      if (storedSessions) {
        const parsedSessions: ChatSession[] = JSON.parse(storedSessions)
        return parsedSessions.find(session => session.id === sessionId) || null
      }
      return null
    } catch (error) {
      console.error('Failed to load session from localStorage:', error)
      return null
    }
  },

  // Helper method to save sessions to localStorage (for localStorage backend)
  saveSessionsToLocalStorage(sessions: ChatSession[], userId: string): void {
    try {
      const storageKey = userId
        ? `agui-chat-sessions-${userId}`
        : 'agui-chat-sessions'
      localStorage.setItem(storageKey, JSON.stringify(sessions))
    } catch (error) {
      console.error('Failed to save sessions to localStorage:', error)
    }
  },

  // Active session management
  saveActiveSessionId(sessionId: string, userId: string): void {
    try {
      const activeSessionKey = userId
        ? `agui-active-session-${userId}`
        : 'agui-active-session'
      localStorage.setItem(activeSessionKey, sessionId)
    } catch (error) {
      console.error('Failed to save active session ID:', error)
    }
  },

  getActiveSessionId(userId: string): string | null {
    try {
      const activeSessionKey = userId
        ? `agui-active-session-${userId}`
        : 'agui-active-session'
      return localStorage.getItem(activeSessionKey)
    } catch (error) {
      console.error('Failed to get active session ID:', error)
      return null
    }
  },

  clearActiveSessionId(userId: string): void {
    try {
      const activeSessionKey = userId
        ? `agui-active-session-${userId}`
        : 'agui-active-session'
      localStorage.removeItem(activeSessionKey)
    } catch (error) {
      console.error('Failed to clear active session ID:', error)
    }
  },

  // Agent execution methods
  async executeAgent(
    agnoBaseURL: string,
    agentId: string,
    message: string,
    options: {
      sessionId?: string
      userId?: string
      stream?: boolean
      files?: File[]
      signal?: AbortSignal
    } = {}
  ): Promise<Response> {
    return await agentTeamApi.createAgentRun(
      agnoBaseURL,
      agentId,
      message,
      options
    )
  },

  async executeTeam(
    agnoBaseURL: string,
    teamId: string,
    message: string,
    options: {
      sessionId?: string
      userId?: string
      stream?: boolean
      monitor?: boolean
      files?: File[]
      signal?: AbortSignal
    } = {}
  ): Promise<Response> {
    return await agentTeamApi.createTeamRun(
      agnoBaseURL,
      teamId,
      message,
      options
    )
  },

  async cancelExecution(
    agnoBaseURL: string,
    executorType: 'agent' | 'team',
    executorId: string,
    runId: string
  ): Promise<void> {
    if (executorType === 'agent') {
      await agentTeamApi.cancelAgentRun(agnoBaseURL, executorId, runId)
    } else {
      await agentTeamApi.cancelTeamRun(agnoBaseURL, executorId, runId)
    }
  },

  async getAvailableAgents(agnoBaseURL: string): Promise<AgentResponse[]> {
    return await agentTeamApi.listAgents(agnoBaseURL)
  },

  async getAvailableTeams(agnoBaseURL: string): Promise<TeamResponse[]> {
    return await agentTeamApi.listTeams(agnoBaseURL)
  },

  async getExecutorDetails(
    agnoBaseURL: string,
    executorType: 'agent' | 'team',
    executorId: string
  ): Promise<AgentResponse | TeamResponse> {
    if (executorType === 'agent') {
      return await agentTeamApi.getAgentDetails(agnoBaseURL, executorId)
    } else {
      return await agentTeamApi.getTeamDetails(agnoBaseURL, executorId)
    }
  },
}

export type ExecutorType = 'agent' | 'team'

// Model configuration types
export type ModelResponse = {
  name: string
  model: string
  provider: string
}

// Agent response schema
export type AgentResponse = {
  id: string
  name: string
  db_id: string
  model: ModelResponse
  tools: any[]
  sessions: any
  knowledge: any
  memory: any
  reasoning: any
  default_tools: any
  system_message: any
  extra_messages: any[]
  response_settings: any
  streaming: any
  metadata: Record<string, any>
  input_schema: any
}

// Team response schema
export type TeamResponse = {
  id: string
  name: string
  db_id: string
  description: string
  model: ModelResponse
  tools: any[]
  sessions: any
  knowledge: any
  memory: any
  reasoning: any
  default_tools: any
  system_message: any
  response_settings: any
  streaming: any
  members: (AgentResponse | TeamResponse)[]
  metadata: Record<string, any>
  input_schema: any
}

export type SessionConfig = {
  userId: string // User ID for session management
  storage?: 'localStorage' // Storage backend (only localStorage for now)
}

export type AssistantCockpitProps = {
  title?: string
  description?: string
  initialMessage?: string
  placeholder?: string
  className?: string
  showConnectionStatus?: boolean
  onMessageSent?: (message: string, callbacks: ActionCallbacks) => void
  onMessageReceived?: (message: ChatMessage, callbacks: ActionCallbacks) => void
  agnoBaseURL: string
  defaultExecutorName: string // Mandatory executor name (agent or team ID)
  defaultExecutorType?: 'agent' | 'team' // Optional executor type, defaults to 'agent'
  initialTools?: Tool[]
  initialContext?: Context[]
  timeout?: number
  maxRetries?: number
  assistantIcon?: React.ReactNode
  retryDelay?: number
  actionMenuItems?: ActionMenuItem[]
  supportsAttachments?: boolean
  maxVisibleActions?: number // Max number of actions to show before moving to overflow menu
  sessions?: SessionConfig // Optional session configuration
}

export const AssistantCockpit = ({
  title = 'AI Assistant',
  description = 'Ask me anything about SQL, data analysis, or query optimization',
  initialMessage,
  placeholder = 'Ask me about SQL, data analysis, or request a query...',
  className,
  onMessageSent,
  onMessageReceived,
  agnoBaseURL,
  defaultExecutorName,
  defaultExecutorType = 'agent',
  assistantIcon,
  initialTools = [],
  initialContext = [],
  timeout = 5000,
  maxRetries = 3,
  retryDelay = 1000,
  actionMenuItems = [],
  showConnectionStatus = true,
  supportsAttachments = false,
  maxVisibleActions = 3,
  sessions,
}: AssistantCockpitProps): React.ReactElement => {
  console.log('[AssistantCockpit] Component rendering with props:', {
    agnoBaseURL,
    defaultExecutorName,
    defaultExecutorType,
    timeout,
    showConnectionStatus,
  })

  // Track unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error(
        '[AssistantCockpit] Unhandled Promise Rejection detected!',
        {
          reason: event.reason,
          promise: event.promise,
          stack: event.reason instanceof Error ? event.reason.stack : undefined,
        }
      )
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (initialMessage) {
      return [
        {
          id: '1',
          role: 'assistant',
          content: initialMessage,
        },
      ]
    }
    return []
  })
  const statusEndpoint = `${agnoBaseURL}/status`

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Streaming state
  const [isCurrentlyStreaming, setIsCurrentlyStreaming] =
    useState<boolean>(false)
  const [abortController, setAbortController] =
    useState<AbortController | null>(null)

  // Session configuration
  const sessionConfig = sessions || {
    userId: 'unknown',
    storage: 'localStorage',
  }
  const isSessionsEnabled = !!sessions
  const userId = sessionConfig.userId

  // Chat session management (only if sessions are enabled)
  const [sessionsList, setSessionsList] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(
    () => {
      // Initialize from saved active session ID if sessions are enabled
      if (isSessionsEnabled) {
        return sessionManager.getActiveSessionId(userId)
      }
      return null
    }
  )

  // Helper function to set current session ID and persist it
  const setCurrentSessionIdWithPersistence = useCallback(
    (sessionId: string | null) => {
      setCurrentSessionId(sessionId)
      if (sessionId && isSessionsEnabled) {
        sessionManager.saveActiveSessionId(sessionId, userId)
      } else if (!sessionId && isSessionsEnabled) {
        sessionManager.clearActiveSessionId(userId)
      }
    },
    [isSessionsEnabled, userId]
  )

  // Connection status state
  const [isConnected, setIsConnected] = useState<boolean | null>(null) // null = not checked yet

  // Rename dialog state (only if sessions are enabled)
  const [renamingSessionId, setRenamingSessionId] = useState<string | null>(
    null
  )
  const [newSessionTitle, setNewSessionTitle] = useState<string>('')

  // Loading states (only if sessions are enabled)
  const [isSessionLoading, setIsSessionLoading] = useState<boolean>(false)
  const [loadingAction, setLoadingAction] = useState<string>('') // "create", "rename", "delete", "load"

  // Ref for autoscrolling
  const conversationEndRef = useRef<HTMLDivElement>(null)

  // State management for action menu items
  const [internalState, setInternalState] = useState<State>({})
  const [internalContext, setInternalContext] =
    useState<Context[]>(initialContext)
  const [internalTools, setInternalTools] = useState<Tool[]>(initialTools)

  const handleInputChange = useCallback((e: any) => {
    setInput(e.target.value)
  }, [])

  // Create action callbacks for action menu items
  const createActionCallbacks = useCallback((): ActionCallbacks => {
    return {
      toast: (message: string, status: ToastStatus) => {
        switch (status) {
          case 'success':
            toast.success(message)
            break
          case 'error':
            toast.error(message)
            break
          case 'info':
            toast.info(message)
            break
          case 'warning':
            toast.warning(message)
            break
        }
      },
      setContext: (context: Context[]) => {
        setInternalContext(context)
      },
      getContext: () => internalContext,
      setState: (state: State) => {
        setInternalState(prev => ({ ...prev, ...state }))
      },
      getState: () => internalState,
      setTool: (tool: Tool) => {
        setInternalTools(prev => {
          const existingIndex = prev.findIndex(t => t.name === tool.name)
          if (existingIndex >= 0) {
            // Update existing tool
            const updated = [...prev]
            updated[existingIndex] = tool
            return updated
          } else {
            // Add new tool
            return [...prev, tool]
          }
        })
      },
      getTools: () => internalTools,
      getMessages: () => messages,
      addActivity: (content: string) => {
        const activityMessage: ChatMessage = {
          id: uuidv4(),
          role: 'activity',
          content: content,
        }
        setMessages(prev => [...prev, activityMessage])
      },
    }
  }, [internalState, internalContext, internalTools, messages])

  // Autoscroll to bottom when messages update
  const scrollToBottom = useCallback(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      })
    }

    // Fallback: scroll the conversation container directly
    const conversationContainer =
      conversationEndRef.current?.closest('.overflow-y-auto')
    if (conversationContainer) {
      conversationContainer.scrollTop = conversationContainer.scrollHeight
    }
  }, [])

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Add defensive logging to debug message structure
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const invalidMessages = messages.filter(msg => !msg || !msg.id)
      if (invalidMessages.length > 0) {
        console.warn('Found invalid messages:', invalidMessages)
      }
    }
  }, [messages])

  // Auto-scroll when streaming or when new messages arrive
  useEffect(() => {
    if (isCurrentlyStreaming || messages.length > 0) {
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        scrollToBottom()
      })
    }
  }, [isCurrentlyStreaming, messages, scrollToBottom])

  const handleSubmit = useCallback(
    async (message: any) => {
      console.log('[handleSubmit] Called with message:', message)

      if (!message?.text?.trim()) {
        console.log('[handleSubmit] Empty message, returning')
        return
      }

      const text = message.text
      console.log('[handleSubmit] Processing message:', text)

      // Clear input immediately
      setInput('')

      // Notify parent component with message and callbacks
      onMessageSent?.(text, createActionCallbacks())

      const userMessage: ChatMessage = {
        id: uuidv4(),
        role: 'user',
        content: text,
      }

      setMessages(prev => [...prev, userMessage])

      // Create abort controller for this request
      const newAbortController = new AbortController()
      setAbortController(newAbortController)

      // Execute agent or team based on session configuration with retry logic
      const executeAI = async () => {
        console.log('[executeAI] Starting AI execution', {
          executorType: defaultExecutorType,
          executorId: defaultExecutorName,
          agnoBaseURL,
        })

        try {
          const executorType = defaultExecutorType
          const executorId = defaultExecutorName

          let lastError: Error | null = null
          let response: Response | null = null

          // Retry logic with exponential backoff
          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            console.log(`[executeAI] Attempt ${attempt}/${maxRetries}`)
            try {
              if (executorType === 'agent') {
                response = await sessionManager.executeAgent(
                  agnoBaseURL,
                  executorId,
                  text,
                  {
                    ...(currentSessionId && { sessionId: currentSessionId }),
                    userId: sessionConfig.userId,
                    stream: true,
                    signal: newAbortController.signal,
                  }
                )
              } else {
                response = await sessionManager.executeTeam(
                  agnoBaseURL,
                  executorId,
                  text,
                  {
                    ...(currentSessionId && { sessionId: currentSessionId }),
                    userId: sessionConfig.userId,
                    stream: true,
                    monitor: true,
                    signal: newAbortController.signal,
                  }
                )
              }

              // If we get here, the request was successful
              break
            } catch (error) {
              console.log(
                `[executeAI] Attempt ${attempt} failed:`,
                error instanceof Error ? error.message : error
              )
              lastError =
                error instanceof Error ? error : new Error('Unknown error')

              // Don't wait after the last attempt
              if (attempt < maxRetries) {
                // Exponential backoff: delay = baseDelay * 2^(attempt - 1) + jitter
                const exponentialDelay = retryDelay * Math.pow(2, attempt - 1)
                const jitter = Math.random() * 0.1 * exponentialDelay // Add 0-10% jitter
                const delay = exponentialDelay + jitter

                console.log(
                  `API retry ${attempt}/${maxRetries}, waiting ${Math.round(delay)}ms...`
                )

                // Add retry notification
                const retryMessage: ChatMessage = {
                  id: uuidv4(),
                  role: 'activity',
                  content: `🔄 Retrying... (${attempt}/${maxRetries})`,
                }
                setMessages(prev => [...prev, retryMessage])

                await new Promise(resolve => setTimeout(resolve, delay))
              }
            }
          }

          if (!response || !response.ok) {
            throw new Error(
              `Execution failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`
            )
          }

          // Handle streaming response
          setIsLoading(true)

          // Process streaming response
          const reader = response.body?.getReader()
          const decoder = new TextDecoder()

          if (reader) {
            // Create assistant message ID but don't add to messages yet
            const assistantMessageId = uuidv4()
            let assistantContent = ''
            let messageAdded = false

            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              const chunk = decoder.decode(value, { stream: true })
              const lines = chunk.split('\n')

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6)
                  if (data.trim()) {
                    try {
                      const parsed = JSON.parse(data)
                      if (parsed.content || parsed.text) {
                        const content = parsed.content || parsed.text
                        assistantContent += content

                        if (!messageAdded) {
                          // Hide loading indicator and add message when we have first content
                          setIsLoading(false)
                          setIsCurrentlyStreaming(true)

                          const assistantMessage: ChatMessage = {
                            id: assistantMessageId,
                            role: 'assistant',
                            content: assistantContent,
                          }
                          setMessages(prev => [...prev, assistantMessage])
                          messageAdded = true
                        } else {
                          // Update existing message
                          setMessages(prev =>
                            prev.map(msg =>
                              msg.id === assistantMessageId
                                ? { ...msg, content: assistantContent }
                                : msg
                            )
                          )
                        }
                      }
                    } catch (e) {
                      // Ignore JSON parse errors for malformed chunks
                    }
                  }
                }
              }
            }

            // Call onMessageReceived callback only if message was added
            if (onMessageReceived && messageAdded) {
              setMessages(prev => {
                const finalMessage = prev.find(
                  msg => msg.id === assistantMessageId
                )
                if (finalMessage && finalMessage.role === 'assistant') {
                  onMessageReceived(finalMessage, createActionCallbacks())
                }
                return prev
              })
            }
          } else {
            throw new Error('No response body received')
          }
        } catch (error) {
          console.log('[executeAI] Main catch block - error occurred:', error)
          // Don't show error message for user-initiated aborts
          if (error instanceof Error && error.name === 'AbortError') {
            console.log(
              '[executeAI] AbortError detected - request was aborted by user'
            )
            return
          }

          console.error('[executeAI] Execution error (non-abort):', error)
          const errorMessage: ChatMessage = {
            id: uuidv4(),
            role: 'activity',
            content: `⚠️ **Execution Error**: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }
          setMessages(prev => [...prev, errorMessage])
        } finally {
          setIsCurrentlyStreaming(false)
          setIsLoading(false)
          setAbortController(null)
        }
      }

      executeAI()
    },
    [
      agnoBaseURL,
      defaultExecutorName,
      defaultExecutorType,
      sessionConfig.userId,
      currentSessionId,
      maxRetries,
      retryDelay,
    ]
  )

  // Abort execution function
  const handleAbortStreaming = useCallback(async () => {
    if (abortController) {
      abortController.abort()
      setAbortController(null)
      setIsCurrentlyStreaming(false)
      setIsLoading(false)

      // Add abort message
      const abortMessage: ChatMessage = {
        id: uuidv4(),
        role: 'activity',
        content: `Generation was stopped by user`,
      }
      setMessages(prev => [...prev, abortMessage])

      // Optionally cancel the agent/team run if we have run information
      // This would require tracking the runId from the response
    }
  }, [abortController])

  // Copy message content to clipboard
  const handleCopyMessage = useCallback((content: string) => {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        toast.success('Message copied to clipboard')
      })
      .catch(err => {
        console.error('Failed to copy message:', err)
        toast.error('Failed to copy message')
      })
  }, [])

  // Handle like/dislike for assistant messages
  const handleLikeMessage = useCallback((messageId: string) => {
    setMessages(prev =>
      prev.map(msg => {
        if (msg.id === messageId) {
          // Toggle like feedback
          const newFeedback = msg.feedback === 'liked' ? undefined : 'liked'
          return { ...msg, feedback: newFeedback }
        }
        return msg
      })
    )
    toast.success(
      "Thanks for your feedback! We'll use this to improve future responses."
    )
  }, [])

  const handleDislikeMessage = useCallback((messageId: string) => {
    setMessages(prev =>
      prev.map(msg => {
        if (msg.id === messageId) {
          // Toggle dislike feedback
          const newFeedback =
            msg.feedback === 'disliked' ? undefined : 'disliked'
          return { ...msg, feedback: newFeedback }
        }
        return msg
      })
    )
    toast.info(
      "Thank you for your feedback. We'll use this to improve our responses."
    )
  }, [])

  // Session management functions (only if sessions are enabled)
  const createNewSession = useCallback(async (): Promise<ChatSession> => {
    if (!isSessionsEnabled) {
      // Return a temporary session if sessions are disabled
      return {
        id: uuidv4(),
        title: 'Chat',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }

    setIsSessionLoading(true)
    setLoadingAction('create')

    try {
      // Create local session (no API calls for session creation)
      const newSession: ChatSession = {
        id: uuidv4(),
        title: 'New Chat',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setSessionsList(prev => [newSession, ...prev])
      setCurrentSessionIdWithPersistence(newSession.id)
      setMessages([])
      setInput('')

      // Only show toast if there are existing sessions (not the first chat)
      if (sessionsList.length > 0) {
        toast.success('New chat created successfully')
      }
      return newSession
    } catch (error) {
      console.error('Failed to create session:', error)
      toast.error(
        `Failed to create new chat: ${error instanceof Error ? error.message : 'Unknown error'}`
      )

      // Remove optimistic session on error and revert to previous session
      setSessionsList(prev =>
        prev.filter(session => !session.id.startsWith('temp-'))
      )

      // Find a session to switch back to
      const remainingSessions = sessionsList.filter(
        s => !s.id.startsWith('temp-')
      )
      if (remainingSessions.length > 0) {
        setCurrentSessionIdWithPersistence(remainingSessions[0].id)
        const session = remainingSessions[0]
        setMessages(session.messages)
        return session
      }

      // Return a fallback session if no other sessions exist
      const fallbackSession: ChatSession = {
        id: uuidv4(),
        title: 'New Chat',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      return fallbackSession
    } finally {
      setIsSessionLoading(false)
      setLoadingAction('')
    }
  }, [
    isSessionsEnabled,
    sessionConfig.storage,
    userId,
    agnoBaseURL,
    sessionsList,
  ])

  const saveCurrentSession = useCallback(
    (sessionMessages: ChatMessage[]) => {
      if (!isSessionsEnabled || !currentSessionId) return

      setSessionsList(prev =>
        prev.map(session => {
          if (session.id === currentSessionId) {
            const firstUserMessage = sessionMessages.find(
              msg => msg.role === 'user'
            )
            const title = firstUserMessage?.content
              ? firstUserMessage.content.substring(0, 50) +
                (firstUserMessage.content.length > 50 ? '...' : '')
              : 'New Chat'

            return {
              ...session,
              title,
              messages: sessionMessages,
              updatedAt: new Date().toISOString(),
            }
          }
          return session
        })
      )
    },
    [isSessionsEnabled, currentSessionId]
  )

  const renameSession = useCallback(
    async (sessionId: string, newTitle: string) => {
      if (!isSessionsEnabled) return

      setIsSessionLoading(true)
      setLoadingAction('rename')

      try {
        // Update local state immediately for responsive UI
        setSessionsList(prev =>
          prev.map(session => {
            if (session.id === sessionId) {
              return {
                ...session,
                title: newTitle.trim() || 'New Chat',
                updatedAt: new Date().toISOString(),
              }
            }
            return session
          })
        )

        // Session renaming is handled locally for localStorage storage
        // No API call needed for localStorage sessions

        toast.success(`Chat renamed successfully`)
      } catch (error) {
        console.error('Failed to rename session:', error)
        toast.error(
          `Failed to rename chat: ${error instanceof Error ? error.message : 'Unknown error'}`
        )

        // Revert local state on error
        const originalSession = sessionsList.find(s => s.id === sessionId)
        if (originalSession) {
          setSessionsList(prev =>
            prev.map(session => {
              if (session.id === sessionId) {
                return originalSession
              }
              return session
            })
          )
        }
      } finally {
        setIsSessionLoading(false)
        setLoadingAction('')
      }
    },
    [
      isSessionsEnabled,
      sessionConfig.storage,
      userId,
      agnoBaseURL,
      sessionsList,
    ]
  )

  const startRenameSession = useCallback(
    (sessionId: string, currentTitle: string) => {
      if (!isSessionsEnabled) return
      setRenamingSessionId(sessionId)
      setNewSessionTitle(currentTitle)
    },
    [isSessionsEnabled]
  )

  const confirmRenameSession = useCallback(async () => {
    if (renamingSessionId && newSessionTitle.trim()) {
      await renameSession(renamingSessionId, newSessionTitle)
      setRenamingSessionId(null)
      setNewSessionTitle('')
    }
  }, [renamingSessionId, newSessionTitle, renameSession])

  const cancelRenameSession = useCallback(() => {
    setRenamingSessionId(null)
    setNewSessionTitle('')
  }, [])

  const switchToSession = useCallback(
    (sessionId: string) => {
      if (!isSessionsEnabled) return
      const session = sessionsList.find(s => s.id === sessionId)
      if (session) {
        setCurrentSessionIdWithPersistence(sessionId)
        setMessages(session.messages)
        setInput('')
      }
    },
    [isSessionsEnabled, sessionsList]
  )

  const deleteSession = useCallback(
    async (sessionId: string) => {
      if (!isSessionsEnabled) return

      const session = sessionsList.find(s => s.id === sessionId)

      setIsSessionLoading(true)
      setLoadingAction('delete')

      try {
        // Update local state (local-only deletion, no API call)
        setSessionsList(prev => prev.filter(s => s.id !== sessionId))

        // Show success toast notification
        if (session) {
          toast.success(`Chat "${session.title}" deleted successfully`)
        }

        if (currentSessionId === sessionId) {
          // Create a new session if deleting the current one
          createNewSession()
        }
      } catch (error) {
        console.error('Failed to delete session:', error)
        toast.error(
          `Failed to delete chat: ${error instanceof Error ? error.message : 'Unknown error'}`
        )

        // Revert local state on error
        if (session) {
          setSessionsList(prev => [...prev, session])
        }
      } finally {
        setIsSessionLoading(false)
        setLoadingAction('')
      }
    },
    [
      isSessionsEnabled,
      sessionConfig.storage,
      userId,
      agnoBaseURL,
      currentSessionId,
      createNewSession,
      sessionsList,
    ]
  )

  const loadSessionsFromStorage = useCallback(async () => {
    if (!isSessionsEnabled) return

    setIsSessionLoading(true)
    setLoadingAction('load')

    try {
      // Load sessions from localStorage
      const sessions = await sessionManager.getSessions(userId)
      setSessionsList(sessions)

      if (sessions.length > 0) {
        // Try to get the saved active session ID
        const savedActiveSessionId = sessionManager.getActiveSessionId(userId)
        let sessionToLoad = sessions[0] // Default to first session

        if (savedActiveSessionId) {
          // Find the saved active session
          const savedSession = sessions.find(s => s.id === savedActiveSessionId)
          if (savedSession) {
            sessionToLoad = savedSession
          }
        }

        // Load the session messages
        setCurrentSessionIdWithPersistence(sessionToLoad.id)
        setMessages(sessionToLoad.messages)
        setInput('')
      } else if (sessions.length === 0) {
        // No sessions exist, create a new one
        createNewSession()
      }
    } catch (error) {
      console.error('Failed to load sessions:', error)
      createNewSession()
    } finally {
      setIsSessionLoading(false)
      setLoadingAction('')
    }
  }, [
    isSessionsEnabled,
    sessionConfig.storage,
    userId,
    agnoBaseURL,
    currentSessionId,
    createNewSession,
  ])

  const saveSessionsToStorage = useCallback(
    (sessionList: ChatSession[]) => {
      if (!isSessionsEnabled) return

      // Use session manager for localStorage, agno sessions are saved via API calls
      if (sessionConfig.storage === 'localStorage') {
        sessionManager.saveSessionsToLocalStorage(sessionList, userId)
      }
      // For agno storage, sessions are saved via API calls during rename/create operations
    },
    [isSessionsEnabled, sessionConfig.storage, userId]
  )

  // Periodic connection status polling (only when not actively streaming)
  useEffect(() => {
    console.log('[Connection Effect] Setting up connection polling', {
      showConnectionStatus,
      statusEndpoint,
      timeout,
    })

    if (!showConnectionStatus || !statusEndpoint) {
      console.log(
        '[Connection Effect] Skipping - connection status disabled or no endpoint'
      )
      return
    }

    const checkConnection = async () => {
      // Don't check connection status during active streaming/requests
      if (isCurrentlyStreaming || isLoading) {
        console.log(
          '[Connection Check] Skipped - streaming or loading in progress'
        )
        return
      }

      console.log(
        '[Connection Check] Starting connection check to:',
        statusEndpoint
      )

      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => {
          console.log('[Connection Check] Timeout reached, aborting request')
          controller.abort()
        }, timeout)

        const response = await fetch(statusEndpoint, {
          method: 'GET',
          signal: controller.signal,
        })

        clearTimeout(timeoutId)
        console.log('[Connection Check] Response received:', response.ok)
        setIsConnected(response.ok)
      } catch (error) {
        console.log(
          '[Connection Check] Error occurred:',
          error instanceof Error ? error.message : error
        )
        // Silently handle connection errors (expected when server is not running)
        setIsConnected(false)
      }
    }

    // Check immediately on mount
    console.log('[Connection Effect] Running initial connection check')
    checkConnection()

    // Set up periodic polling every 4 seconds
    console.log('[Connection Effect] Setting up polling interval (4s)')
    const intervalId = setInterval(checkConnection, 4000)

    return () => {
      console.log('[Connection Effect] Cleaning up - clearing interval')
      clearInterval(intervalId)
    }
  }, [
    showConnectionStatus,
    statusEndpoint,
    isCurrentlyStreaming,
    isLoading,
    timeout,
  ])

  // Load sessions on component mount (only once and only if sessions are enabled)
  useEffect(() => {
    if (isSessionsEnabled) {
      loadSessionsFromStorage()
    }
  }, [isSessionsEnabled]) // Only run when sessions enabled or on mount

  // Scroll to bottom on initial mount and when initial messages are loaded
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom()
    }, 100) // Small delay to ensure the conversation is rendered

    return () => clearTimeout(timer)
  }, []) // Empty dependency array - only run once on mount

  // Scroll to bottom when initial session messages are loaded (only if sessions are enabled)
  useEffect(() => {
    if (isSessionsEnabled && messages.length > 0) {
      const timer = setTimeout(() => {
        scrollToBottom()
      }, 50) // Small delay to ensure DOM updates are complete

      return () => clearTimeout(timer)
    }
    return undefined // Explicit return for TypeScript
  }, [isSessionsEnabled, currentSessionId]) // When session changes and messages are loaded

  // Save sessions whenever they change (remove saveSessionsToStorage from deps)
  useEffect(() => {
    if (isSessionsEnabled && sessionsList.length > 0) {
      saveSessionsToStorage(sessionsList)
    }
  }, [isSessionsEnabled, sessionsList]) // Remove saveSessionsToStorage from deps

  // Auto-save current session when messages change (remove saveCurrentSession from deps)
  useEffect(() => {
    if (isSessionsEnabled && messages.length > 0 && currentSessionId) {
      saveCurrentSession(messages)
    }
  }, [isSessionsEnabled, messages, currentSessionId]) // Remove saveCurrentSession from deps

  return (
    <Card
      className={cn(
        'flex flex-col h-full to-muted/20 border-2 shadow-lg py-0 rounded-none',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b from-primary/5 to-primary/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/5 text-primary border">
            {assistantIcon ? assistantIcon : <Bot className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Chat History Dropdown - Only show when sessions are enabled and there are multiple sessions */}
          {isSessionsEnabled && sessionsList.length > 1 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                  title="Chat history"
                >
                  <History className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuPortal>
                <DropdownMenuContent className="w-80" align="end" side="bottom">
                  {sessionsList.length === 0 ? (
                    <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                      No chat history yet
                    </div>
                  ) : (
                    <>
                      {sessionsList.slice(0, 5).map(session => {
                        const isActiveSession = session.id === currentSessionId
                        const isRenaming = renamingSessionId === session.id
                        return (
                          <DropdownMenuItem
                            key={session.id}
                            className={cn(
                              'flex-col items-start p-3',
                              isActiveSession
                                ? 'bg-green-100 dark:bg-green-700/60 cursor-default opacity-75'
                                : 'cursor-pointer hover:bg-accent'
                            )}
                            onClick={() =>
                              !isActiveSession &&
                              !isRenaming &&
                              switchToSession(session.id)
                            }
                            disabled={isActiveSession || isRenaming}
                          >
                            <div className="flex items-start justify-between w-full">
                              <div className="flex-1 min-w-0 max-w-[200px] text-ellipsis">
                                {isRenaming ? (
                                  <div className="flex items-center gap-2 w-full">
                                    <input
                                      type="text"
                                      value={newSessionTitle}
                                      onChange={e =>
                                        setNewSessionTitle(e.target.value)
                                      }
                                      onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                          confirmRenameSession()
                                        } else if (e.key === 'Escape') {
                                          cancelRenameSession()
                                        }
                                      }}
                                      onClick={e => e.stopPropagation()}
                                      className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                                      placeholder="Chat title..."
                                      autoFocus
                                      disabled={
                                        isSessionLoading &&
                                        loadingAction === 'rename'
                                      }
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={e => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        confirmRenameSession()
                                      }}
                                      disabled={
                                        isSessionLoading &&
                                        loadingAction === 'rename'
                                      }
                                      className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                                      title="Save"
                                    >
                                      {isSessionLoading &&
                                      loadingAction === 'rename' ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : (
                                        '✓'
                                      )}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={e => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        cancelRenameSession()
                                      }}
                                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                      title="Cancel"
                                    >
                                      ✕
                                    </Button>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-center gap-2">
                                      <h4
                                        className={cn(
                                          'font-medium text-sm truncate',
                                          isActiveSession
                                            ? 'text-green-800 dark:text-green-300'
                                            : ''
                                        )}
                                      >
                                        {session.title}
                                      </h4>
                                      {isActiveSession && (
                                        <div className="flex items-center gap-1 text-xs text-green-700 dark:text-green-300">
                                          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                          <span>Active</span>
                                        </div>
                                      )}
                                    </div>
                                    <p
                                      className={cn(
                                        'text-xs mt-1',
                                        isActiveSession
                                          ? 'text-green-700 dark:text-green-300'
                                          : 'text-muted-foreground'
                                      )}
                                    >
                                      {new Date(
                                        session.updatedAt
                                      ).toLocaleDateString()}
                                    </p>
                                  </>
                                )}
                              </div>
                              {!isRenaming && (
                                <div className="flex items-center gap-1">
                                  {!isActiveSession && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={e => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        startRenameSession(
                                          session.id,
                                          session.title
                                        )
                                      }}
                                      disabled={isSessionLoading}
                                      className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                      title="Rename chat"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                  )}
                                  {!isActiveSession && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={e => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        deleteSession(session.id)
                                      }}
                                      disabled={
                                        isSessionLoading &&
                                        loadingAction === 'delete'
                                      }
                                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      title="Delete chat"
                                    >
                                      {isSessionLoading &&
                                      loadingAction === 'delete' ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : (
                                        <Trash2 className="h-3 w-3" />
                                      )}
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          </DropdownMenuItem>
                        )
                      })}

                      {sessionsList.length > 5 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-center text-sm text-muted-foreground cursor-default">
                            {sessionsList.length - 5} more chats...
                          </DropdownMenuItem>
                        </>
                      )}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenuPortal>
            </DropdownMenu>
          )}

          {/* New Chat Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={createNewSession}
            disabled={isSessionLoading && loadingAction === 'create'}
            className="text-muted-foreground hover:text-foreground"
            title={
              isSessionLoading && loadingAction === 'create'
                ? 'Creating...'
                : 'New chat'
            }
          >
            {isSessionLoading && loadingAction === 'create' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>

          <div
            className={cn(
              'flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium',
              isConnected
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
            )}
          >
            {isConnected ? (
              <Wifi className="w-3 h-3" />
            ) : (
              <WifiOff className="w-3 h-3" />
            )}
          </div>

          {/* Note: AGIStreaming component replaced with direct agent/team execution */}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <Conversation className="h-full">
          <ConversationContent className="p-4">
            {messages.length === 0 ? (
              <ConversationEmptyState
                title="Start a conversation"
                description="Ask me anything about SQL, data analysis, or query optimization"
                icon={<Sparkles className="w-8 h-8 text-muted-foreground" />}
              />
            ) : (
              <>
                {messages.map(message => {
                  if (message.role === 'activity') {
                    // System message - centered, no role, no buttons
                    return (
                      <div
                        key={message.id}
                        className="flex justify-center my-4"
                      >
                        <div className="max-w-md mx-auto text-center px-4 py-3 bg-blue-200/10 border border-blue-500/50 rounded-full">
                          <MessageContent className="text-xs text-blue-700 dark:text-blue-400 text-center mx-auto">
                            {message.content}
                          </MessageContent>
                        </div>
                      </div>
                    )
                  }

                  // Regular message with role labels and action buttons
                  return (
                    <Message
                      key={message.id}
                      from={message.role as 'user' | 'assistant'}
                      className={message.role === 'user' ? 'min-w-[168px]' : ''}
                    >
                      <div className="flex flex-col">
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                            <span
                              className={
                                message.role === 'user'
                                  ? 'text-yellow-700 dark:text-yellow-400'
                                  : 'text-blue-700 dark:text-blue-400'
                              }
                            >
                              {message.role === 'user' ? 'User' : 'Assistant'}
                            </span>
                          </div>
                          <MessageContent>{message.content}</MessageContent>
                        </div>
                        <div className="flex items-center gap-1 mt-3 pt-3 border-t opacity-80 hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleCopyMessage(message.content)}
                            className="h-6 w-6"
                            title="Copy message"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          {message.role === 'assistant' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleLikeMessage(message.id)}
                                className={`h-6 w-6 transition-colors ${
                                  message.feedback === 'liked'
                                    ? 'text-green-700 bg-green-100 dark:bg-green-900/30'
                                    : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                                }`}
                                title={
                                  message.feedback === 'liked'
                                    ? 'Remove like'
                                    : 'Like response'
                                }
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleDislikeMessage(message.id)}
                                className={`h-6 w-6 transition-colors ${
                                  message.feedback === 'disliked'
                                    ? 'text-red-700 bg-red-100 dark:bg-red-900/30'
                                    : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                                }`}
                                title={
                                  message.feedback === 'disliked'
                                    ? 'Remove dislike'
                                    : 'Dislike response'
                                }
                              >
                                <ThumbsDown className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </Message>
                  )
                })}

                {/* Loading indicator when waiting for response (only before content arrives) */}
                {isLoading && !isCurrentlyStreaming && (
                  <Message from="assistant" className="animate-pulse">
                    <div className="flex flex-col">
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                          <span className="text-blue-700 dark:text-blue-400">
                            Assistant
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </Message>
                )}
              </>
            )}
            {/* Invisible element for autoscrolling */}
            <div ref={conversationEndRef} style={{ height: 0 }} />
          </ConversationContent>
        </Conversation>
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <PromptInput onSubmit={handleSubmit} className="w-full">
          <PromptInputTextarea
            value={input}
            onChange={handleInputChange}
            placeholder={
              isCurrentlyStreaming ? 'Generating response...' : placeholder
            }
            disabled={isCurrentlyStreaming}
            className="min-h-12 resize-none rounded-none"
          />

          <PromptInputFooter className="border-t">
            <PromptInputTools>
              {isCurrentlyStreaming ? (
                // Show pause button when streaming
                <Button
                  onClick={handleAbortStreaming}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Stop generation"
                >
                  <Square className="w-4 h-4" />
                </Button>
              ) : (
                // Show action menu items as individual buttons with overflow menu
                <>
                  {supportsAttachments && <AttachmentButton />}

                  {/* Visible action items */}
                  {actionMenuItems
                    .slice(0, maxVisibleActions)
                    .map((item, index) => (
                      <Button
                        key={index}
                        onClick={() => item.onClick(createActionCallbacks())}
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground"
                        disabled={item.disabled}
                        title={item.label}
                      >
                        {item.label}
                      </Button>
                    ))}

                  {/* Overflow menu for remaining items */}
                  {actionMenuItems.length > maxVisibleActions && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground"
                          title="More actions"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuContent align="end" side="top">
                          {actionMenuItems
                            .slice(maxVisibleActions)
                            .map((item, index) => (
                              <DropdownMenuItem
                                key={index}
                                onClick={() =>
                                  item.onClick(createActionCallbacks())
                                }
                                disabled={item.disabled ?? false}
                                className="cursor-pointer"
                              >
                                {item.label}
                              </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                      </DropdownMenuPortal>
                    </DropdownMenu>
                  )}
                </>
              )}
            </PromptInputTools>

            {isCurrentlyStreaming ? (
              // Show streaming indicator instead of submit button
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </div>
            ) : (
              // Show submit button when not streaming
              <PromptInputSubmit
                {...(isLoading ? { status: 'submitted' as ChatStatus } : {})}
                disabled={!input.trim() && !isLoading}
              />
            )}
          </PromptInputFooter>
        </PromptInput>
      </div>

      {/* Toast Notifications */}
      <Toaster position="top-right" />
    </Card>
  )
}
