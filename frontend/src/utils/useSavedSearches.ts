import { useEffect, useState } from 'react';
import { SavedSearch, searchesChangedEvent } from './savedSearches';
import { loadSavedSearches, readVisibleSearches } from './savedSearchApi';

type SearchState = {
  userId?: string;
  searches: SavedSearch[];
  loading: boolean;
  error: string;
};

export const useSavedSearches = (user?: firebase.User | null): Omit<SearchState, 'userId'> => {
  const userId = user?.uid;
  const [state, setState] = useState<SearchState>(() => ({
    userId,
    searches: readVisibleSearches(userId),
    loading: Boolean(user),
    error: '',
  }));

  useEffect(() => {
    let mounted = true;
    const refresh = () => {
      if (mounted) {
        setState((previous) => ({ ...previous, userId, searches: readVisibleSearches(userId) }));
      }
    };
    const load = () => {
      if (!user) return;
      setState((previous) => ({ ...previous, userId, loading: true, error: '' }));
      loadSavedSearches(user).then(
        () => {
          if (mounted) setState((previous) => ({ ...previous, loading: false }));
        },
        (cause) => {
          console.error('Failed to load saved searches', cause);
          if (mounted) {
            setState((previous) => ({
              ...previous,
              loading: false,
              error: 'Could not load saved searches. Try again when online.',
            }));
          }
        }
      );
    };
    refresh();
    load();
    window.addEventListener(searchesChangedEvent, refresh);
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', load);
    return () => {
      mounted = false;
      window.removeEventListener(searchesChangedEvent, refresh);
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', load);
    };
  }, [user, userId]);

  if (state.userId !== userId) {
    return { searches: readVisibleSearches(userId), loading: Boolean(user), error: '' };
  }
  return { searches: state.searches, loading: state.loading, error: state.error };
};
