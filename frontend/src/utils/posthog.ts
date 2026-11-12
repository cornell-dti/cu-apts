import posthog from 'posthog-js';

const POSTHOG_KEY = process.env.REACT_APP_POSTHOG_KEY;
const POSTHOG_HOST = process.env.REACT_APP_POSTHOG_HOST || 'https://us.i.posthog.com';

/**
 * Initializes PostHog analytics. No-ops when REACT_APP_POSTHOG_KEY is not set,
 * so local development without the key still works.
 */
export const initPostHog = (): void => {
  if (!POSTHOG_KEY) return;
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    // Track pageviews on react-router navigations, not just full page loads
    capture_pageview: 'history_change',
    person_profiles: 'identified_only',
  });
};

export const isPostHogEnabled = (): boolean => Boolean(POSTHOG_KEY);

export default posthog;
