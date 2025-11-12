import { SQLCockpit, ThemeProvider } from '@blockether/foundation-react'
import "./App.css";

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-foreground">
              Foundation React Cockpit Demo
            </h1>
            <p className="text-muted-foreground mt-2">
              Basic demonstration of the SQL Cockpit component from @blockether/foundation-react
            </p>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                SQL Cockpit Component
              </h2>
              <div className="bg-card rounded-lg border p-6">
                <SQLCockpit />
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                About This Demo
              </h2>
              <div className="bg-card rounded-lg border p-6 space-y-4">
                <p className="text-muted-foreground">
                  This is a basic React application built with Vite that demonstrates the usage of the SQL Cockpit component
                  from the @blockether/foundation-react library.
                </p>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-foreground">Technologies Used:</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>React 18 with TypeScript</li>
                    <li>Vite for build tooling</li>
                    <li>@blockether/foundation-react from NPM</li>
                    <li>TailwindCSS for styling</li>
                    <li>shadcn/ui design system</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App
