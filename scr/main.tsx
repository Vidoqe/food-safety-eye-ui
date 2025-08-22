import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AppProvider } from './contexts/AppContext';
import { UserProvider } from './contexts/UserContext';

createRoot(document.getElementById("root")!).render(
  <AppProvider>
    <UserProvider>
      <App />
    </UserProvider>
  </AppProvider>
);