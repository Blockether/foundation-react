import { createContext, useContext, ReactNode } from 'react'

interface ShadowDOMContext {
  container: HTMLElement | ShadowRoot | null
  withinShadowDOM: boolean
}

const ShadowDOMContext = createContext<ShadowDOMContext>({
  container: null,
  withinShadowDOM: false,
})

export function ShadowDOMProvider({
  children,
  container
}: {
  children: ReactNode
  container: HTMLElement | ShadowRoot | null
}) {
  return (
    <ShadowDOMContext.Provider value={{
      container,
      withinShadowDOM: !!container
    }}>
      {children}
    </ShadowDOMContext.Provider>
  )
}

export function useShadowDOM() {
  const context = useContext(ShadowDOMContext)
  return context
}