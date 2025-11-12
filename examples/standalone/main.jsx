import { SQLCockpit, ThemeProvider } from '@blockether/foundation-react'
import { createRoot } from 'react-dom/client';

window.mountAIInsights = (element) => {
    const root = createRoot(element)
    root.render(
        <div className='blockether-foundation'>
            <ThemeProvider>
                <SQLCockpit />
            </ThemeProvider >
        </div>
    )
}