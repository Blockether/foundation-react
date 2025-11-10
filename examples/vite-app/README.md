# Foundation React SQL Cockpit Demo

A basic React application demonstrating the SQL Cockpit component from @blockether/foundation-react library.

## Overview

This example project shows how to integrate and use the SQL Cockpit component from the @blockether/foundation-react NPM package in a React application built with Vite.

## Technologies Used

- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **@blockether/foundation-react** - Main library containing the SQL Cockpit component
- **TailwindCSS** for styling
- **shadcn/ui** design system foundation

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Clone this repository or copy the example folder
2. Install dependencies:

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173` to see the demo.

### Building

Build the application for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
src/
├── lib/
│   └── utils.ts          # Utility functions for shadcn/ui
├── App.tsx               # Main application component with cockpit
├── index.css             # TailwindCSS styles with shadcn/ui theme
└── main.tsx              # React application entry point
```

## Key Features

- **SQL Cockpit Component**: Demonstrates the integration of the SQL Cockpit component from @blockether/foundation-react
- **ThemeProvider**: Proper theming setup for consistent design
- **Responsive Design**: Built with TailwindCSS for responsive layouts
- **TypeScript**: Full type safety throughout the application

## Usage

The main application demonstrates how to:

1. Import and use the `SQLCockpit` and `ThemeProvider` components
2. Set up proper styling with TailwindCSS and shadcn/ui
3. Structure a React application with Vite

```tsx
import { SQLCockpit, ThemeProvider } from '@blockether/foundation-react'

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <SQLCockpit />
      </div>
    </ThemeProvider>
  )
}
```

## Customization

You can customize the appearance by modifying:

- **TailwindCSS configuration** (`tailwind.config.js`)
- **CSS variables** in `src/index.css` for theming
- **Component props** passed to the SQLCockpit component

## Learn More

- [Vite Documentation](https://vite.dev/)
- [React Documentation](https://react.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [@blockether/foundation-react Documentation](https://github.com/blockether/foundation-react)
