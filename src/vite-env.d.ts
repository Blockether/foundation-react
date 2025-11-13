/// <reference types="vite/client" />

declare module '*.wasm?url' {
  const content: string
  export default content
}

declare module '*.js?url' {
  const content: string
  export default content
}
