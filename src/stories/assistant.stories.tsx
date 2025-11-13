// ===== AI ASSISTANT STORIES =====
// These stories are focused on AI Assistant chat functionality with AG-UI protocol support

import { AssistantCockpit } from '@/components/cockpit/ai/assistant'
import type {
  ActionCallbacks,
  Message,
} from '@/components/cockpit/ai/assistant'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof AssistantCockpit> = {
  title: 'Assistant Cockpit',
  component: AssistantCockpit,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'An AI-powered chat interface component with AG-UI protocol support, connection status monitoring, streaming responses, and retry logic. Features a modern gradient design with comprehensive error handling.',
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'Light',
          value: '#ffffff',
        },
        {
          name: 'Dark',
          value: '#2d2d30',
        },
      ],
    },
    viewport: {
      viewports: {
        fullscreen: {
          name: 'Fullscreen',
          styles: {
            width: '100vw',
            height: '100vh',
          },
        },
      },
      defaultViewport: 'fullscreen',
    },
  },
  argTypes: {
    title: {
      description: 'Title displayed in the header',
      control: 'text',
    },
    description: {
      description: 'Description displayed in the header',
      control: 'text',
    },
    initialMessage: {
      description: 'Initial message from the assistant',
      control: 'text',
    },
    placeholder: {
      description: 'Placeholder text for the input field',
      control: 'text',
    },
    showConnectionStatus: {
      description: 'Whether to show connection status indicator',
      control: 'boolean',
    },
    agnoBaseURL: {
      description: 'Endpoint for AGUI chat requests',
      control: 'text',
    },
    initialTools: {
      description: 'Initial tools available to the AI assistant',
      control: { type: 'object' },
    },
    initialContext: {
      description: 'Initial AG-UI context to provide to the assistant',
      control: { type: 'object' },
    },
    timeout: {
      description: 'Request timeout in milliseconds',
      control: 'number',
    },
    maxRetries: {
      description: 'Maximum number of retry attempts',
      control: 'number',
    },
    retryDelay: {
      description: 'Delay between retries in milliseconds',
      control: 'number',
    },
    supportsAttachments: {
      description: 'Whether to show attachment button',
      control: 'boolean',
    },
    actionMenuItems: {
      description: 'Custom action menu items',
      control: { type: 'object' },
    },
    maxVisibleActions: {
      description:
        'Maximum number of action items to show before moving to overflow menu',
      control: { type: 'number' },
    },
    sessions: {
      description: 'Session configuration for chat history management',
      control: { type: 'object' },
    },
    onMessageSent: {
      description:
        'Callback when a complete message is received from the assistant',
      action: 'messageReceived',
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof AssistantCockpit>

// Default AI Assistant
export const Default: Story = {
  render: () => (
    <div className="h-screen p-4">
      <AssistantCockpit
        title="AI Assistant"
        description="AI-powered assistant with AG-UI protocol support"
        initialMessage="👋 Welcome! I'm your AI Assistant. How can I help you today?"
        placeholder="Ask me anything..."
        agnoBaseURL="http://localhost:8080"
        defaultExecutorName="conversational-agent"
        initialTools={[
          {
            name: 'sql',
            description: 'SQL query execution and analysis',
            parameters: {},
          },
          {
            name: 'data-analysis',
            description: 'Data analysis and visualization',
            parameters: {},
          },
          {
            name: 'visualization',
            description: 'Chart and graph generation',
            parameters: {},
          },
        ]}
        timeout={5000}
        maxRetries={3}
        retryDelay={1000}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Basic AI Assistant with AG-UI protocol support. Features connection status monitoring, streaming responses, retry logic with exponential backoff, and comprehensive error handling. Uses the /agui endpoint for all communication.',
      },
    },
  },
}

// AI Assistant with Initial Context
export const WithInitialContext: Story = {
  render: () => (
    <div className="h-screen p-4">
      <AssistantCockpit
        title="AI Assistant with Context"
        description="Pre-configured with user preferences and context"
        initialMessage="👋 Hello! I've been initialized with your preferences and project context."
        placeholder="Ask me anything..."
        agnoBaseURL="http://localhost:8080"
        defaultExecutorName="conversational-agent"
        initialTools={[
          {
            name: 'sql',
            description: 'SQL query execution and analysis',
            parameters: {},
          },
          {
            name: 'data-analysis',
            description: 'Data analysis and visualization',
            parameters: {},
          },
        ]}
        initialContext={[
          {
            description: 'User expertise level',
            value: 'Advanced technical user',
          },
          {
            description: 'Response style preference',
            value: 'Prefers detailed technical explanations',
          },
          {
            description: 'Current project',
            value: 'Data analytics dashboard with SQL integration',
          },
          { description: 'Preferred language', value: 'TypeScript' },
        ]}
        timeout={5000}
        maxRetries={3}
        retryDelay={1000}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'AI Assistant with initial AG-UI context. The initialContext prop provides background information about user preferences and project context, automatically included in all AG-UI requests for more relevant responses.',
      },
    },
  },
}

// AI Assistant with Attachments Support
export const WithAttachments: Story = {
  render: () => (
    <div className="h-screen p-4">
      <AssistantCockpit
        title="AI Assistant with Attachments"
        description="Upload files and ask questions about your data"
        initialMessage="👋 Hello! I can help analyze your files. Upload documents, images, or datasets to get started!"
        placeholder="Ask me about your files..."
        agnoBaseURL="http://localhost:8080"
        defaultExecutorName="conversational-agent"
        initialTools={[
          {
            name: 'sql',
            description: 'SQL query execution and analysis',
            parameters: {},
          },
          {
            name: 'data-analysis',
            description: 'Data analysis and visualization',
            parameters: {},
          },
          {
            name: 'file-processing',
            description: 'File upload and processing',
            parameters: {},
          },
        ]}
        timeout={5000}
        maxRetries={3}
        retryDelay={1000}
        supportsAttachments={true}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'AI Assistant with file attachment support enabled. Users can upload files alongside their messages for analysis and processing.',
      },
    },
  },
}

// AI Assistant with Custom Actions
export const WithCustomActions: Story = {
  render: () => {
    const handleMessageSent = (message: string, callbacks: ActionCallbacks) => {
      console.log('Message sent:', message)
      console.log('Callbacks available:', Object.keys(callbacks))
    }

    return (
      <div className="h-screen p-4">
        <AssistantCockpit
          title="AI Assistant with Actions"
          description="Enhanced assistant with custom action buttons"
          initialMessage="👋 Welcome! I have additional actions available in the input toolbar."
          placeholder="Ask me anything..."
          agnoBaseURL="http://localhost:8080"
          defaultExecutorName="conversational-agent"
          initialTools={[
            {
              name: 'sql',
              description: 'SQL query execution and analysis',
              parameters: {},
            },
            {
              name: 'data-analysis',
              description: 'Data analysis and visualization',
              parameters: {},
            },
          ]}
          timeout={5000}
          maxRetries={3}
          retryDelay={1000}
          onMessageSent={handleMessageSent}
          supportsAttachments={true}
          maxVisibleActions={3}
          actionMenuItems={[
            {
              label: 'Clear Chat',
              onClick: ({ toast, addActivity }) => {
                console.log('Clear chat clicked')
                addActivity('Chat was cleared by user')
                toast('Chat cleared successfully!', 'success')
              },
            },
            {
              label: 'Export',
              onClick: ({
                toast,
                getContext,
                getState,
                getMessages,
                addActivity,
              }) => {
                console.log('Export chat clicked')
                const context = getContext()
                const state = getState()
                const messages = getMessages()
                console.log('Current context:', context)
                console.log('Current state:', state)
                console.log('Total messages:', messages.length)
                addActivity(`Exported ${messages.length} messages to file`)
                toast('Chat exported successfully!', 'success')
              },
            },
            {
              label: 'Add Context',
              onClick: ({ setContext, toast, addActivity }) => {
                console.log('Adding context')
                setContext([
                  {
                    description: 'User preference',
                    value: 'Prefers concise responses',
                  },
                  { description: 'Session type', value: 'Demo session' },
                ])
                addActivity('User context preferences updated')
                toast('Context added successfully!', 'success')
              },
            },
          ]}
        />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          'AI Assistant with custom action menu items demonstrating the full ActionCallbacks API. Actions provide access to toast notifications, context management, state management, tool management, message access, and activity logging. With maxVisibleActions=3, additional actions move to an overflow menu.',
      },
    },
  },
}

// AI Assistant with Session Management
export const WithSessions: Story = {
  render: () => (
    <div className="h-screen p-4">
      <AssistantCockpit
        title="AI Assistant - Session Management"
        description="Chat with session history stored in browser"
        initialMessage="👋 Welcome! I'm your AI Assistant with session management. You can create multiple chats, rename them, and switch between them. Your chat history is stored locally in your browser."
        placeholder="Ask me anything..."
        agnoBaseURL="http://localhost:8080"
        defaultExecutorName="conversational-agent"
        sessions={{ storage: 'localStorage', userId: 'demo-user' }}
        timeout={5000}
        maxRetries={3}
        retryDelay={1000}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'AI Assistant with localStorage-based session management. Chat history is stored in the browser localStorage and persists across page refreshes. Features session switching with full history preservation, rename and delete sessions, and user-specific storage with userId.',
      },
    },
  },
}

// AI Assistant with Callbacks
export const WithCallbacks: Story = {
  render: () => {
    const handleMessageSent = (message: string, callbacks: ActionCallbacks) => {
      console.log('📤 Message sent:', message)

      // Example: Add context when user sends a question
      if (message.includes('?')) {
        callbacks.addActivity('❓ User asked a question')
      }

      // Example: Track message count in state
      const currentState = callbacks.getState()
      callbacks.setState({
        ...currentState,
        userMessageCount: (currentState.userMessageCount || 0) + 1,
      })
    }

    const handleMessageReceived = (
      message: Message,
      callbacks: ActionCallbacks
    ) => {
      console.log('📥 Complete message received:', message)
      console.log('📝 Message content:', message.content)

      // Example: Track assistant message count
      const currentState = callbacks.getState()
      callbacks.setState({
        ...currentState,
        assistantMessageCount: (currentState.assistantMessageCount || 0) + 1,
      })

      // Example: Auto-save important messages to state
      if (message.content.toLowerCase().includes('important')) {
        const importantMessages = currentState.importantMessages || []
        callbacks.setState({
          ...currentState,
          importantMessages: [...importantMessages, message],
        })
        callbacks.addActivity('💾 Important message auto-saved to state')
      }
    }

    return (
      <div className="h-screen p-4">
        <AssistantCockpit
          title="AI Assistant with Callbacks"
          description="Demonstrates onMessageSent and onMessageReceived callbacks"
          initialMessage="👋 Try sending me a message! Both send and receive callbacks will fire. Try including the word 'important' or ask a question with '?'"
          placeholder="Ask me anything..."
          agnoBaseURL="http://localhost:8080"
          defaultExecutorName="conversational-agent"
          initialTools={[
            {
              name: 'sql',
              description: 'SQL query execution and analysis',
              parameters: {},
            },
            {
              name: 'data-analysis',
              description: 'Data analysis and visualization',
              parameters: {},
            },
          ]}
          timeout={5000}
          maxRetries={3}
          retryDelay={1000}
          onMessageSent={handleMessageSent}
          onMessageReceived={handleMessageReceived}
        />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates both onMessageSent and onMessageReceived callbacks with full ActionCallbacks access. onMessageSent fires when user sends a message, receiving message text and all ActionCallbacks. onMessageReceived fires when assistant completes a message (after streaming), receiving the complete Message object and all ActionCallbacks. Example uses include tracking message counts, adding activity logs for questions, and auto-saving important messages.',
      },
    },
  },
}

// AI Assistant with Agno Backend Sessions
export const WithAgnoSessions: Story = {
  render: () => {
    const handleMessageSent = (
      message: string,
      _callbacks: ActionCallbacks
    ) => {
      console.log('Message sent:', message)
      console.log('Using agno backend sessions')
    }

    return (
      <div className="h-screen p-4">
        <AssistantCockpit
          title="AI Assistant - Agno Sessions"
          description="Chat with session history stored in agno backend"
          initialMessage="👋 Welcome! I'm your AI Assistant with agno backend session management. Your chat history is stored securely in the agno database and synchronized across devices."
          placeholder="Ask me anything..."
          agnoBaseURL="http://localhost:8080"
          defaultExecutorName="conversational-agent"
          defaultExecutorType="agent"
          sessions={{
            storage: 'localStorage',
            userId: 'demo-user-123',
          }}
          timeout={5000}
          maxRetries={3}
          retryDelay={1000}
          onMessageSent={handleMessageSent}
        />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          'AI Assistant with localStorage session management using defaultExecutor configuration. Chat history is stored locally in the browser. Features client-side session storage, session persistence across page reloads, active session tracking, and local state management. Uses defaultExecutorName and defaultExecutorType for session filtering.',
      },
    },
  },
}
