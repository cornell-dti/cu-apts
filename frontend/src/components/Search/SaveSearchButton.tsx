import React, { ReactElement } from 'react';
import { Button } from '@material-ui/core';
import StarIcon from '@material-ui/icons/Star';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import { FilterState } from './FilterSection';
import { hasSearchCriteria, searchId, toggleSavedSearch } from '../../utils/savedSearches';
import { useSavedSearches } from '../../utils/useSavedSearches';

type Props = {
  mode: 'manual' | 'ai';
  query: string;
  filters: FilterState;
  userId?: string;
};

const SaveSearchButton = ({ mode, query, filters, userId }: Props): ReactElement | null => {
  const searches = useSavedSearches(userId);
  if (!hasSearchCriteria(query, filters, mode)) return null;
  const saved = searches.some((item) => item.id === searchId(mode, query, filters) && item.savedAt);

  return (
    <Button
      variant="outlined"
      color="primary"
      startIcon={saved ? <StarIcon /> : <StarBorderIcon />}
      onClick={() => toggleSavedSearch(mode, query, filters, userId)}
    >
      {saved ? 'Saved search' : 'Save search'}
    </Button>
  );
};

export default SaveSearchButton;
