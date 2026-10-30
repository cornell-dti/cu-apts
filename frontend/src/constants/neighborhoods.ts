import { NeighborhoodId } from '../../../common/types/ai-search-types';

export type NeighborhoodInfo = {
  readonly displayName: string;
  readonly distanceText: string;
  readonly description: string;
};

// NOTE FOR TEAM REVIEW: the descriptions and distance text below are curated content,
// not verified facts. Please review and edit before shipping.
export const NEIGHBORHOODS: Readonly<Record<NeighborhoodId, NeighborhoodInfo>> = {
  COLLEGETOWN: {
    displayName: 'Collegetown',
    distanceText: '0.1–0.5 miles to Cornell',
    description: 'Best for walkability and social life, but often more expensive and noisy.',
  },
  NORTH: {
    displayName: 'North Campus / Cornell Heights',
    distanceText: '0.2–1 mile to Cornell',
    description:
      'Primary location for undergrads and grads who want to be close to North Campus dorms.',
  },
  DOWNTOWN: {
    displayName: 'Downtown / The Commons',
    distanceText: 'walkable to dining',
    description: 'Favored by grad students for lower rents and a city feel.',
  },
  WEST: {
    displayName: 'West Campus',
    // TODO: confirm display name, add distance text and description.
    distanceText: 'TODO',
    description: 'TODO',
  },
};
