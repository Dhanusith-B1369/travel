import { createContext, useContext, useState, ReactNode } from 'react';

export type Screen =
  | { type: 'dashboard' }
  | { type: 'myTrips' }
  | { type: 'createTrip' }
  | { type: 'editTrip'; tripId: string }
  | { type: 'viewTrip'; tripId: string }
  | { type: 'publicTrip'; tripId: string }
  | { type: 'profile' };

interface NavigationContextType {
  currentScreen: Screen;
  navigate: (screen: Screen) => void;
  goBack: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState<Screen>({ type: 'dashboard' });
  const [history, setHistory] = useState<Screen[]>([]);

  const navigate = (screen: Screen) => {
    setHistory(prev => [...prev, currentScreen]);
    setCurrentScreen(screen);
  };

  const goBack = () => {
    if (history.length > 0) {
      const previous = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setCurrentScreen(previous);
    }
  };

  return (
    <NavigationContext.Provider value={{ currentScreen, navigate, goBack }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}
