import { useEffect, useState } from 'react';
import { readSearches, SavedSearch, searchesChangedEvent } from './savedSearches';

export const useSavedSearches = (userId?: string): SavedSearch[] => {
  const [searches, setSearches] = useState<SavedSearch[]>(() => readSearches(userId));

  useEffect(() => {
    const refresh = () => setSearches(readSearches(userId));
    refresh();
    window.addEventListener(searchesChangedEvent, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(searchesChangedEvent, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [userId]);

  return searches;
};
