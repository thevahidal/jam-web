import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { MantineProvider, ColorSchemeProvider, ColorScheme } from '@mantine/core';
import { QueryClient, QueryClientProvider } from "react-query";

import App from './App'
import './index.css'

const queryClient = new QueryClient();

const Main = () => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
)
