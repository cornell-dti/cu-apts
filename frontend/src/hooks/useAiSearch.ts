import { useEffect, useState } from 'react';
import { AiSearchResponse } from '../../../common/types/ai-search-types';
import { MOCK_AI_SEARCH_RESPONSE } from '../mocks/aiSearchMock';

const MOCK_DELAY_MS = 1000;

/**
 * Fetches the AI search response for a query. Currently resolves the mock after a short delay;
 * swap the body for a real request (e.g. `get`/axios against the AI search endpoint) later.
 */
const fetchAiSearch = (query: string): Promise<AiSearchResponse> =>
  new Promise((resolve) => {
    setTimeout(() => resolve({ ...MOCK_AI_SEARCH_RESPONSE, query }), MOCK_DELAY_MS);
  });

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
 * (`error`). Stale responses from a previous query are ignored.
 */
export const useAiSearch = (query: string): AiSearchState => {
  const [state, setState] = useState<AiSearchState>({ data: null, loading: false, error: null });

  useEffect(() => {
    if (query.trim() === '') {
      setState({ data: null, loading: false, error: null });
      return;
    }
    let cancelled = false;
    setState({ data: null, loading: true, error: null });
    fetchAiSearch(query)
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: err instanceof Error ? err : new Error('AI search failed'),
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  return state;
};
