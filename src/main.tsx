
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { FeatureFlags } from './services/features/types';

// Declare the global window extension
declare global {
  interface Window {
    __FEATURE_FLAGS__?: FeatureFlags;
  }
}

createRoot(document.getElementById("root")!).render(<App />);
