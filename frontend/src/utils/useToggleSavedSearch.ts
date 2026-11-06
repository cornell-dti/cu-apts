import { useState } from 'react';
import { FilterState } from '../components/Search/FilterSection';
import { getUser } from './firebase';
import { toggleSavedSearch } from './savedSearchApi';
import { SavedSearch } from './savedSearches';

export const useToggleSavedSearch = (
  user: firebase.User | null,
  setUser: React.Dispatch<React.SetStateAction<firebase.User | null>>
) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggle = async (mode: SavedSearch['mode'], query: string, filters: FilterState) => {
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      const activeUser = user || (await getUser(true));
      if (!activeUser) throw new Error('Sign in required');
      if (!user) setUser(activeUser);
      await toggleSavedSearch(mode, query, filters, activeUser);
    } catch (cause) {
      console.error('Could not update saved search', cause);
      setError('Could not update saved search. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return { toggle, saving, error };
};
