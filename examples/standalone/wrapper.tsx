import {
  Composer,
  FoundationProvider,
  SQLCockpit,
} from '@blockether/foundation-react'
import { Database } from 'lucide-react'
import { createRoot } from 'react-dom/client'
import styles from './styles.css?inline'

async function llmCompletionFunction(params: {
  userRequest: string
  dataSources: Array<{
    name: string
    tableName: string
    schema?: any[]
  }>
  currentQuery: string
}): Promise<string> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(
        `-- This is a mock response for the user request: "${params.userRequest.trim()}"\nSELECT * FROM ${params.dataSources[0].tableName} LIMIT 10;`
      )
    }, 1000)
  })
}

export function mountAIInsights(
  element: Element,
  initialDataSources: any[] = []
) {
  const shadowRoot = element.attachShadow({ mode: 'open' })

  // Inject styles into shadow DOM
  const style = document.createElement('style')
  style.textContent = styles
  shadowRoot.appendChild(style)
  const mountPoint = document.createElement('div')
  shadowRoot.appendChild(mountPoint)

  // Create root on mountPoint inside shadow DOM, not the original element
  const root = createRoot(mountPoint)

  root.render(
    <FoundationProvider
      config={{
        defaultTheme: 'light',
        container: shadowRoot,
      }}
    >
      <Composer
        cockpits={[
          {
            id: 'sql',
            name: 'SQL Cockpit',
            component: (
              <SQLCockpit
                initialDataSources={initialDataSources}
                llmCompletionFunction={llmCompletionFunction}
              />
            ),
            icon: <Database className="w-4 h-4" />,
          },
        ]}
      ></Composer>
    </FoundationProvider>
  )
}

// Also expose on window for backwards compatibility with script tags
; (window as any).mountAIInsights = mountAIInsights
