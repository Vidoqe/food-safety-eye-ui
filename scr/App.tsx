
import { AppProvider } from "@/contexts/AppContext";
import { UserProvider } from "@/contexts/UserContext";
import Index from "@/pages/Index";

export default function App() {
  return (
    <UserProvider>
      <AppProvider>
        <Index />
      </AppProvider>
    </UserProvider>
  );
}