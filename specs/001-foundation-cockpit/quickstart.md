# Quickstart Guide: Blockether Foundation Cockpit Component

**Date**: 2025-11-06
**Purpose**: Developer usage guide and integration examples

## Overview

The CockpitsComposer is a minimal, responsive container component built on shadcn/ui primitives. It provides a clean foundation for embedding other @blockether/foundation-react components while inheriting styling and behavior from parent containers.

## Installation

```bash
npm install @blockether/foundation-react
# or
pnpm add @blockether/foundation-react
# or
yarn add @blockether/foundation-react
```

## Basic Usage

### Import

```typescript
import { CockpitsComposer } from '@blockether/foundation-react';
```

### Simple Example

```tsx
import { CockpitsComposer } from '@blockether/foundation-react';

function App() {
  return (
    <div style={{ width: '800px' }}>
      <CockpitsComposer>
        <p>Your content here</p>
      </CockpitsComposer>
    </div>
  );
}
```

## Props Reference

### CockpitsComposerProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | `undefined` | Content to render inside the cockpit |
| `className` | `string` | `undefined` | Additional TailwindCSS classes for customization |
| `asChild` | `boolean` | `false` | Render as child element (shadcn/ui pattern) |
| `...divProps` | `ComponentPropsWithoutRef<'div'>` | `inherited` | Standard HTML div attributes |

## Examples

### Responsive Container

```tsx
function ResponsiveExample() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <CockpitsComposer>
        <h2>Responsive Content</h2>
        <p>This cockpit inherits width from parent container.</p>
      </CockpitsComposer>
    </div>
  );
}
```

### Custom Styling

```tsx
import { CockpitsComposer } from '@blockether/foundation-react';

function StyledExample() {
  return (
    <CockpitsComposer className="bg-blue-50 border-blue-200 p-6">
      <h3>Custom Styled Cockpit</h3>
      <p>Custom background and border colors.</p>
    </CockpitsComposer>
  );
}
```

### Nested Components

```tsx
function NestedExample() {
  return (
    <CockpitsComposer className="p-4">
      <CockpitsComposer className="p-2 bg-muted">
        <p>Nested cockpit with different styling.</p>
      </CockpitsComposer>
    </CockpitsComposer>
  );
}
```

### With Form Elements

```tsx
function FormExample() {
  return (
    <CockpitsComposer className="p-6">
      <form className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
    </CockpitsComposer>
  );
}
```

### Accessibility Example

```tsx
function AccessibilityExample() {
  return (
    <CockpitsComposer
      role="region"
      aria-labelledby="cockpit-title"
      aria-describedby="cockpit-description"
    >
      <h2 id="cockpit-title">Accessible Cockpit</h2>
      <p id="cockpit-description">
        This cockpit has proper ARIA attributes for screen readers.
      </p>
    </CockpitsComposer>
  );
}
```

## Theming

### Using Theme Tokens

```tsx
function ThemedExample() {
  return (
    <CockpitsComposer className="bg-card text-card-foreground">
      <h3>Themed Cockpit</h3>
      <p>Uses design system theme tokens.</p>
    </CockpitsComposer>
  );
}
```

### Dark Mode Support

The component automatically supports dark mode through TailwindCSS CSS variables:

```tsx
// No additional configuration needed
<DarkModeProvider>
  <CockpitsComposer>
    <p>Content adapts to dark/light theme automatically.</p>
  </CockpitsComposer>
</DarkModeProvider>
```

## Common Patterns

### Layout Container

```tsx
function LayoutExample() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <CockpitsComposer className="py-4">
          <h1>Application Header</h1>
        </CockpitsComposer>
      </header>

      <main className="flex-1">
        <CockpitsComposer className="py-8">
          <p>Main content area</p>
        </CockpitsComposer>
      </main>

      <footer className="border-t">
        <CockpitsComposer className="py-4">
          <p>Application footer</p>
        </CockpitsComposer>
      </footer>
    </div>
  );
}
```

### Card Container

```tsx
function CardExample() {
  return (
    <CockpitsComposer className="p-6 shadow-lg">
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">Card Title</h3>
          <p className="text-muted-foreground">Card description goes here.</p>
        </div>
        <button className="btn btn-secondary">Action</button>
      </div>
    </CockpitsComposer>
  );
}
```

### Dashboard Widget

```tsx
function DashboardWidget() {
  return (
    <CockpitsComposer className="h-64 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Widget Title</h3>
        <button className="p-1 hover:bg-muted rounded">
          <SettingsIcon className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 p-4">
        <p>Widget content area</p>
      </div>
    </CockpitsComposer>
  );
}
```

## Integration with Other Libraries

### Python Backend Integration

```tsx
import { useData } from '@blockether/foundation-react';

function PythonIntegrationExample() {
  const { data, loading, error } = useData('/api/python-endpoint');

  return (
    <CockpitsComposer className="p-6">
      {loading && <p>Loading data from Python backend...</p>}
      {error && <p className="text-destructive">Error: {error.message}</p>}
      {data && (
        <div>
          <h3>Data from Python Backend</h3>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </CockpitsComposer>
  );
}
```

## Testing Examples

### Unit Testing

```tsx
import { render, screen } from '@testing-library/react';
import { CockpitsComposer } from '@blockether/foundation-react';

describe('CockpitsComposer', () => {
  it('renders children correctly', () => {
    render(
      <CockpitsComposer>
        <p>Test content</p>
      </CockpitsComposer>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <CockpitsComposer className="custom-class">
        <p>Test</p>
      </CockpitsComposer>
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
```

## Storybook Stories

The component includes comprehensive Storybook stories. View them by running:

```bash
npm run storybook
```

Navigate to "Foundation/CockpitsComposer" to see:
- Basic usage examples
- Responsive behavior demonstrations
- Theming variations
- Accessibility examples

## Troubleshooting

### Common Issues

**Q: Component doesn't inherit parent width**
```tsx
// Ensure parent has defined width
<div style={{ width: '500px' }}>
  <CockpitsComposer>
    {/* Will respect 500px width */}
  </CockpitsComposer>
</div>
```

**Q: Custom classes not applying**
```tsx
// Check that TailwindCSS is configured properly
// Ensure custom classes are valid TailwindCSS classes
<CockpitsComposer className="bg-red-500 text-white">
  {/* Should work if TailwindCSS is set up correctly */}
</CockpitsComposer>
```

**Q: Component not rendering**
```tsx
// Ensure proper import
import { CockpitsComposer } from '@blockether/foundation-react';

// Check that component is exported from library
console.log(CockpitsComposer); // Should not be undefined
```

## Migration Guide

### From Regular div

```tsx
// Before
<div className="container">{children}</div>

// After
<CockpitsComposer className="container">
  {children}
</CockpitsComposer>
```

### From Other Container Components

```tsx
// Before
<Container className="my-class">{children}</Container>

// After
<CockpitsComposer className="my-class">
  {children}
</CockpitsComposer>
```

## Best Practices

1. **Use for Layout**: Ideal for creating consistent layout containers
2. **Responsive Design**: Let parent containers handle breakpoints
3. **Theming**: Use TailwindCSS theme tokens for consistency
4. **Accessibility**: Add appropriate ARIA attributes when used as regions
5. **Performance**: Component is lightweight, suitable for frequent use

## Support

For issues, questions, or contributions:
- GitHub Repository: [link to repo]
- Documentation: [link to docs]
- Storybook: Run `npm run storybook` for interactive examples