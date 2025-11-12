import { SQLCockpit, ThemeProvider, Composer, ShadowDOMProvider } from '@blockether/foundation-react'
import { createRoot } from 'react-dom/client';
import { Database } from 'lucide-react';
import styles from "./styles.css?inline";

(window as any).mountAIInsights = (element: Element, initialDataSources: any[]) => {
    const shadowRoot = element.attachShadow({ mode: 'open' });

    // Inject styles into shadow DOM
    const style = document.createElement('style');
    style.textContent = styles;
    shadowRoot.appendChild(style);

    const mountPoint = document.createElement('div');
    shadowRoot.appendChild(mountPoint);

    // Create root on mountPoint inside shadow DOM, not the original element
    const root = createRoot(mountPoint);

    root.render(
        <ThemeProvider defaultTheme='light'>
            <ShadowDOMProvider container={shadowRoot}>
                <Composer cockpits={
                    [{
                        id: 'sql',
                        name: 'SQL Cockpit',
                        component: (
                            <SQLCockpit initialDataSources={initialDataSources} />
                        ),
                        icon: <Database className="w-4 h-4" />,
                    },]
                }>
                </Composer>
            </ShadowDOMProvider>
        </ThemeProvider>
    )
}