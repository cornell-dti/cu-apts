import axios from 'axios';
import { createAuthHeaders } from './firebase';
import {
  hasSearchCriteria,
  readSearches,
  recordSearch,
  replaceSavedSearches,
  SavedSearch,
  searchId,
} from './savedSearches';
import { FilterState } from '../components/Search/FilterSection';

const accountSearches = new Map<string, SavedSearch[]>();
const pendingLoads = new Map<string, Promise<SavedSearch[]>>();
const accountRevisions = new Map<string, number>();
const pendingWrites = new Map<string, Promise<void>>();

const revision = (userId: string) => accountRevisions.get(userId) || 0;
const updateAccountSearches = (userId: string, saved: SavedSearch[]) => {
  accountRevisions.set(userId, revision(userId) + 1);
  accountSearches.set(userId, saved);
  replaceSavedSearches(saved, userId);
};

export const readVisibleSearches = (userId?: string): SavedSearch[] => {
  const local = readSearches(userId);
  if (!userId || !accountSearches.has(userId)) return local;
  const saved = accountSearches.get(userId) || [];
  return [
    ...saved,
    ...local.filter((item) => !item.savedAt && !saved.some((entry) => entry.id === item.id)),
  ];
};

/** Refresh account favorites; local recent searches remain on this device. */
export const loadSavedSearches = (user: firebase.User): Promise<SavedSearch[]> => {
  const pending = pendingLoads.get(user.uid);
  if (pending) return pending;

  const load = (async () => {
    const startingRevision = revision(user.uid);
    const token = await user.getIdToken(false);
    const response = await axios.get<SavedSearch[]>(
      '/api/saved-searches',
      createAuthHeaders(token)
    );
    if (startingRevision !== revision(user.uid)) {
      return accountSearches.get(user.uid) || response.data;
    }
    accountSearches.set(user.uid, response.data);
    replaceSavedSearches(response.data, user.uid);
    return response.data;
  })();
  pendingLoads.set(user.uid, load);
  load.then(
    () => pendingLoads.delete(user.uid),
    () => pendingLoads.delete(user.uid)
  );
  return load;
};

/** The server is authoritative: update the local display only after its write succeeds. */
const writeSavedSearch = async (
  mode: SavedSearch['mode'],
  query: string,
  filters: FilterState,
  user: firebase.User
): Promise<void> => {
  if (!hasSearchCriteria(query, filters, mode)) return;
  const id = searchId(mode, query, filters);
  const saved = await loadSavedSearches(user);
  const token = await user.getIdToken(false);
  const previous = saved.find((item) => item.id === id);

  if (previous) {
    await axios.delete('/api/saved-searches', { ...createAuthHeaders(token), data: { id } });
    const next = saved.filter((item) => item.id !== id);
    updateAccountSearches(user.uid, next);
    recordSearch(mode, query, filters, user.uid);
  } else {
    const response = await axios.post<SavedSearch>(
      '/api/saved-searches',
      { id, mode, query, filters },
      createAuthHeaders(token)
    );
    const next = [response.data, ...saved];
    updateAccountSearches(user.uid, next);
  }
};

export const toggleSavedSearch = (
  mode: SavedSearch['mode'],
  query: string,
  filters: FilterState,
  user: firebase.User
): Promise<void> => {
  const previous = pendingWrites.get(user.uid) || Promise.resolve();
  const write = previous.catch(() => {}).then(() => writeSavedSearch(mode, query, filters, user));
  pendingWrites.set(user.uid, write);
  write.then(
    () => {
      if (pendingWrites.get(user.uid) === write) pendingWrites.delete(user.uid);
    },
    () => {
      if (pendingWrites.get(user.uid) === write) pendingWrites.delete(user.uid);
    }
  );
  return write;
};
