# @blockether/foundation-react

React-based chat UI foundation with integrated SQL analysis capabilities.

## Installation

```bash
npm install @blockether/foundation-react
# or
pnpm add @blockether/foundation-react
# or
yarn add @blockether/foundation-react
```

## Quick Start

```tsx
import { FoundationProvider, SQLCockpit } from '@blockether/foundation-react'

function App() {
  return (
    <FoundationProvider config={{ defaultTheme: 'light' }}>
      <SQLCockpit />
    </FoundationProvider>
  )
}
```

## Features

- **Unified Provider**: `FoundationProvider` combines theme, logging, and shadow DOM support
- **SQL Cockpit**: Interactive SQL editor with DuckDB integration
- **AI Assistant**: Chat interface with completion support
- **Shadow DOM Support**: Full encapsulation for embedding in web components
- **Comprehensive Logging**: Centralized, configurable logging system
- **TypeScript**: Full type safety throughout

## License

MIT