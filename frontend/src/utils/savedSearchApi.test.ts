import axios from 'axios';
import { defaultFilters } from '../components/Search/FilterSection';
import { loadSavedSearches, readVisibleSearches, toggleSavedSearch } from './savedSearchApi';
import { searchId } from './savedSearches';

jest.mock('axios');
jest.mock('./firebase', () => ({
  createAuthHeaders: (token: string) => ({ headers: { Authorization: `Bearer ${token}` } }),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const user = (uid: string) =>
  ({ uid, getIdToken: jest.fn().mockResolvedValue('token') } as unknown as firebase.User);

beforeEach(() => {
  localStorage.clear();
  jest.resetAllMocks();
});

test('saved searches load from the account and are isolated by user', async () => {
  const saved = {
    id: searchId('ai', 'quiet studio', defaultFilters),
    mode: 'ai' as const,
    query: 'quiet studio',
    filters: defaultFilters,
    lastSearchedAt: 1,
    savedAt: 2,
  };
  mockedAxios.get.mockResolvedValueOnce({ data: [saved] }).mockResolvedValueOnce({ data: [] });

  await loadSavedSearches(user('account-a'));
  await loadSavedSearches(user('account-b'));

  expect(readVisibleSearches('account-a')).toEqual([saved]);
  expect(readVisibleSearches('account-b')).toEqual([]);
  expect(mockedAxios.get).toHaveBeenCalledWith('/api/saved-searches', {
    headers: { Authorization: 'Bearer token' },
  });
});

test('saving and unsaving update the display only after the server succeeds', async () => {
  const account = user('account-toggle');
  const saved = {
    id: searchId('ai', 'near campus', defaultFilters),
    mode: 'ai' as const,
    query: 'near campus',
    filters: defaultFilters,
    lastSearchedAt: 1,
    savedAt: 2,
  };
  mockedAxios.get.mockResolvedValueOnce({ data: [] }).mockResolvedValueOnce({ data: [saved] });
  mockedAxios.post.mockResolvedValue({ data: saved });
  mockedAxios.delete.mockResolvedValue({ status: 204 });

  await toggleSavedSearch('ai', saved.query, defaultFilters, account);
  expect(readVisibleSearches(account.uid).some((item) => item.savedAt)).toBe(true);

  await toggleSavedSearch('ai', saved.query, defaultFilters, account);
  expect(readVisibleSearches(account.uid).some((item) => item.savedAt)).toBe(false);
  expect(mockedAxios.delete).toHaveBeenCalledWith('/api/saved-searches', {
    headers: { Authorization: 'Bearer token' },
    data: { id: saved.id },
  });
});

test('a failed save leaves the search unsaved', async () => {
  const account = user('account-failure');
  mockedAxios.get.mockResolvedValue({ data: [] });
  mockedAxios.post.mockRejectedValue(new Error('Network error'));

  await expect(toggleSavedSearch('ai', 'campus', defaultFilters, account)).rejects.toThrow();
  expect(readVisibleSearches(account.uid)).toEqual([]);
});
