import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/common/ErrorBoundary.tsx';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
   <ErrorBoundary>
    <Toaster/>
    <App />
   </ErrorBoundary>
  </BrowserRouter>
)
