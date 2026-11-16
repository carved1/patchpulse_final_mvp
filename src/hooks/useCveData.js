import { useContext } from 'react';
import { CveDataContext } from '../contexts/CveDataContext';

export function useCveData() {
  const context = useContext(CveDataContext);
  if (!context) {
    throw new Error('useCveData must be used inside a CveDataProvider');
  }
  return context;
}
