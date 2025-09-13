import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * DisplayModeContext - Manages quotation display mode state across components
 * 
 * This context provides:
 * - Global display mode state ('lumpsum' or 'bifurcated')
 * - Persistence across browser sessions
 * - Synchronization between QuotationSummary and Dashboard downloads
 */

const DisplayModeContext = createContext();

// Storage key for persistence
const DISPLAY_MODE_STORAGE_KEY = 'rera_easy_display_mode';

export const useDisplayMode = () => {
  const context = useContext(DisplayModeContext);
  if (!context) {
    throw new Error('useDisplayMode must be used within a DisplayModeProvider');
  }
  return context;
};

export const DisplayModeProvider = ({ children }) => {
  // Initialize state from localStorage or default to 'bifurcated'
  const [displayMode, setDisplayModeState] = useState(() => {
    try {
      const stored = localStorage.getItem(DISPLAY_MODE_STORAGE_KEY);
      return stored && ['lumpsum', 'bifurcated'].includes(stored) ? stored : 'bifurcated';
    } catch (error) {
      console.warn('Failed to read display mode from localStorage:', error);
      return 'bifurcated';
    }
  });

  // Wrapper function to persist changes to localStorage
  const setDisplayMode = (mode) => {
    if (!['lumpsum', 'bifurcated'].includes(mode)) {
      console.warn('Invalid display mode:', mode);
      return;
    }
    
    setDisplayModeState(mode);
    
    try {
      localStorage.setItem(DISPLAY_MODE_STORAGE_KEY, mode);
      console.log(`Display mode updated to: ${mode}`);
    } catch (error) {
      console.warn('Failed to save display mode to localStorage:', error);
    }
  };

  // Helper function to get display mode for API calls
  const getDisplayModeForAPI = () => displayMode;

  // Helper function to get display mode label for UI
  const getDisplayModeLabel = () => {
    return displayMode === 'lumpsum' ? 'Lump Sum Amount' : 'Bifurcated Summary';
  };

  // Helper function to get display mode description for UI
  const getDisplayModeDescription = () => {
    return displayMode === 'lumpsum' 
      ? 'Shows only header totals and quotation total'
      : 'Shows detailed breakdown of all service prices';
  };

  const value = {
    displayMode,
    setDisplayMode,
    getDisplayModeForAPI,
    getDisplayModeLabel,
    getDisplayModeDescription,
    isLumpSum: displayMode === 'lumpsum',
    isBifurcated: displayMode === 'bifurcated'
  };

  return (
    <DisplayModeContext.Provider value={value}>
      {children}
    </DisplayModeContext.Provider>
  );
};

export default DisplayModeContext;
