import { useEffect, useState } from 'react';
import axios from 'axios';
import { AiSearchResponse } from '../../../common/types/ai-search-types';

const RATE_LIMITED_MESSAGE = "You're searching a lot. Please wait a minute and try again.";
const BUSY_MESSAGE = 'Search is busy right now. Please try again.';
const GENERIC_MESSAGE = 'Something went wrong. Please try again.';

const errorMessageFor = (err: unknown): string => {
  const status = axios.isAxiosError(err) ? err.response?.status : undefined;
  if (status === 429) return RATE_LIMITED_MESSAGE;
  if (status === 503) return BUSY_MESSAGE;
  return GENERIC_MESSAGE;
};

// Requests in flight, by query. Each search costs two Gemini calls against a 5/min limit, so
// effects that re-run for the same query (StrictMode remounts, re-renders) share one request.
const inFlight = new Map<string, Promise<AiSearchResponse>>();

const fetchAiSearch = (query: string): Promise<AiSearchResponse> => {
  const existing = inFlight.get(query);
  if (existing) return existing;
  const request = axios
    .post<AiSearchResponse>('/api/ai-search', { query })
    .then((response) => response.data)
    .finally(() => inFlight.delete(query));
  inFlight.set(query, request);
  return request;
};

type AiSearchState = {
  readonly data: AiSearchResponse | null;
  readonly loading: boolean;
  readonly error: Error | null;
};

/**
 * useAiSearch – loads AI search results for the given query.
 *
 * @param query - The user's natural-language query; an empty query performs no request.
 * @returns The response (`data`), whether a request is in flight (`loading`), and any failure
 * (`error`). A response for a previous query is ignored if the query has changed.
 */
export const useAiSearch = (query: string): AiSearchState => {
  const [state, setState] = useState<AiSearchState>({ data: null, loading: false, error: null });

  useEffect(() => {
    if (query.trim() === '') {
      setState({ data: null, loading: false, error: null });
      return;
    }
    const trimmed = query.trim();
    let cancelled = false;
    setState({ data: null, loading: true, error: null });
    fetchAiSearch(trimmed)
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: new Error(errorMessageFor(err)),
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  return state;
};
