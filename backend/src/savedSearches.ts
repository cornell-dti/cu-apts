import { createHash } from 'crypto';
import { Router } from 'express';
import { db } from './firebase-config';
import authenticate from './auth';

type SearchFilters = {
  locations: string[];
  minPrice: string;
  maxPrice: string;
  bedrooms: number;
  bathrooms: number;
  initialSortBy: string;
  initialSortLowToHigh: boolean;
};

type SavedSearch = {
  id: string;
  mode: 'manual' | 'ai';
  query: string;
  filters: SearchFilters;
  lastSearchedAt: number;
  savedAt: number;
};

export const savedSearchDocumentId = (userId: string, searchId: string): string =>
  createHash('sha256')
    .update(JSON.stringify([userId, searchId]))
    .digest('hex');

export const parseSavedSearch = (
  input: unknown
): Omit<SavedSearch, 'lastSearchedAt' | 'savedAt'> | null => {
  if (!input || typeof input !== 'object') return null;
  const { id, mode, query, filters: rawFilters } = input as Record<string, unknown>;
  const filters = rawFilters as Partial<SearchFilters> | null;
  if (
    typeof id !== 'string' ||
    id.length > 2048 ||
    (mode !== 'manual' && mode !== 'ai') ||
    typeof query !== 'string' ||
    query.length > 500 ||
    !filters ||
    typeof filters !== 'object' ||
    !Array.isArray(filters.locations) ||
    filters.locations.length > 4 ||
    !filters.locations.every((location: unknown) =>
      ['Collegetown', 'North', 'West', 'Downtown'].includes(location as string)
    ) ||
    typeof filters.minPrice !== 'string' ||
    filters.minPrice.length > 32 ||
    typeof filters.maxPrice !== 'string' ||
    filters.maxPrice.length > 32 ||
    typeof filters.bedrooms !== 'number' ||
    !Number.isInteger(filters.bedrooms) ||
    filters.bedrooms < 0 ||
    typeof filters.bathrooms !== 'number' ||
    !Number.isInteger(filters.bathrooms) ||
    filters.bathrooms < 0 ||
    typeof filters.initialSortBy !== 'string' ||
    filters.initialSortBy.length > 100 ||
    typeof filters.initialSortLowToHigh !== 'boolean'
  ) {
    return null;
  }

  const expectedId = JSON.stringify([
    mode,
    query.trim().toLowerCase(),
    mode === 'ai'
      ? null
      : [
          [...filters.locations].sort(),
          filters.minPrice,
          filters.maxPrice,
          filters.bedrooms,
          filters.bathrooms,
          filters.initialSortBy,
          filters.initialSortLowToHigh,
        ],
  ]);
  const hasCriteria =
    query.trim() ||
    (mode === 'manual' &&
      (filters.locations.length ||
        filters.minPrice ||
        filters.maxPrice ||
        filters.bedrooms ||
        filters.bathrooms));
  if (id !== expectedId || !hasCriteria) return null;

  return { id, mode, query: query.trim(), filters: filters as SearchFilters };
};

const savedSearchCollection = db.collection('savedSearches');
const router = Router();

router.get('/', authenticate, async (req, res) => {
  try {
    if (!req.user) return res.status(401).send('Not authenticated');
    const snapshot = await savedSearchCollection.where('userId', '==', req.user.uid).get();
    return res.status(200).json(snapshot.docs.map((doc) => doc.data().search));
  } catch (error) {
    console.error('Error fetching saved searches:', error);
    return res.status(500).send('Error fetching saved searches');
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    if (!req.user) return res.status(401).send('Not authenticated');
    const input = parseSavedSearch(req.body);
    if (!input) return res.status(400).send('Invalid saved search');

    const document = savedSearchCollection.doc(savedSearchDocumentId(req.user.uid, input.id));
    const previous = await document.get();
    if (previous.exists && previous.data()?.userId !== req.user.uid) {
      return res.status(403).send('Forbidden');
    }
    const now = Date.now();
    const search: SavedSearch = {
      ...input,
      lastSearchedAt: previous.data()?.search?.lastSearchedAt || now,
      savedAt: previous.data()?.search?.savedAt || now,
    };
    await document.set({ userId: req.user.uid, search });
    return res.status(previous.exists ? 200 : 201).json(search);
  } catch (error) {
    console.error('Error saving search:', error);
    return res.status(500).send('Error saving search');
  }
});

router.delete('/', authenticate, async (req, res) => {
  try {
    if (!req.user) return res.status(401).send('Not authenticated');
    const { id } = req.body || {};
    if (typeof id !== 'string' || id.length > 2048) {
      return res.status(400).send('Invalid saved search');
    }
    const document = savedSearchCollection.doc(savedSearchDocumentId(req.user.uid, id));
    const existing = await document.get();
    if (existing.exists && existing.data()?.userId !== req.user.uid) {
      return res.status(403).send('Forbidden');
    }
    if (existing.exists) await document.delete();
    return res.status(204).send();
  } catch (error) {
    console.error('Error removing saved search:', error);
    return res.status(500).send('Error removing saved search');
  }
});

export default router;
