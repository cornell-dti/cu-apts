import type { FilterState } from '../components/Search/FilterSection';

export function tagIdsQueryFromSearch(search: string): string {
  if (!search) {
    return '';
  }
  const p = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
  const raw = p.get('filters');
  if (!raw) {
    return '';
  }
  let parsed: Partial<FilterState> = {};
  try {
    parsed = JSON.parse(decodeURIComponent(raw)) as Partial<FilterState>;
  } catch {
    try {
      parsed = JSON.parse(raw) as Partial<FilterState>;
    } catch {
      return '';
    }
  }
  const tagIds = parsed.tagIds;
  if (Array.isArray(tagIds) && tagIds.length > 0) {
    return `tagIds=${encodeURIComponent(tagIds.join(','))}`;
  }
  return '';
}

export function tagIdsSearchSuffix(search: string): string {
  const q = tagIdsQueryFromSearch(search);
  return q ? `?${q}` : '';
}
