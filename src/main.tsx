
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Declare the global window extension
declare global {
  interface Window {
    __FEATURE_FLAGS__?: any;
  }
}

createRoot(document.getElementById("root")!).render(<App />);
