// ============================================
// JOCH Bandpage - Concert Mode Context
// Global state for concert lightshow activation
// ============================================

import React, { createContext, useContext } from 'react';

interface ConcertModeContextType {
  isShowActive: boolean;
}

const ConcertModeContext = createContext<ConcertModeContextType | undefined>(undefined);

export const useConcertModeContext = () => {
  const context = useContext(ConcertModeContext);
  if (!context) {
    throw new Error('useConcertModeContext must be used within ConcertModeProvider');
  }
  return context;
};

interface ConcertModeProviderProps {
  isShowActive: boolean;
  children: React.ReactNode;
}

export const ConcertModeProvider: React.FC<ConcertModeProviderProps> = ({
  isShowActive,
  children,
}) => {
  return (
    <ConcertModeContext.Provider value={{ isShowActive }}>
      {children}
    </ConcertModeContext.Provider>
  );
};
