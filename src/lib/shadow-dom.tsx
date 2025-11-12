import { createContext, ReactNode, useContext } from 'react'

interface ShadowDOMContext {
  container: HTMLElement | ShadowRoot | null
}

const ShadowDOMContext = createContext<ShadowDOMContext>({
  container: null,
})

export function ShadowDOMProvider({
  children,
  container,
}: {
  children: ReactNode
  container: HTMLElement | ShadowRoot | null
}) {
  return (
    <ShadowDOMContext.Provider
      value={{
        container,
      }}
    >
      {children}
    </ShadowDOMContext.Provider>
  )
}

export function useShadowDOM() {
  const context = useContext(ShadowDOMContext)
  return context
}
