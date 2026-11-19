import React, { ReactElement } from 'react';
import { Button, Typography } from '@material-ui/core';
import StarIcon from '@material-ui/icons/Star';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import { FilterState } from './FilterSection';
import { hasSearchCriteria, searchId } from '../../utils/savedSearches';
import { useSavedSearches } from '../../utils/useSavedSearches';
import { useToggleSavedSearch } from '../../utils/useToggleSavedSearch';

type Props = {
  mode: 'manual' | 'ai';
  query: string;
  filters: FilterState;
  user: firebase.User | null;
  setUser: React.Dispatch<React.SetStateAction<firebase.User | null>>;
};

const SaveSearchButton = ({ mode, query, filters, user, setUser }: Props): ReactElement | null => {
  const { searches, loading, error: loadError } = useSavedSearches(user);
  const { toggle, saving, error } = useToggleSavedSearch(user, setUser);
  if (!hasSearchCriteria(query, filters, mode)) return null;
  const saved = searches.some((item) => item.id === searchId(mode, query, filters) && item.savedAt);

  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        disabled={saving || loading}
        startIcon={saved ? <StarIcon /> : <StarBorderIcon />}
        onClick={() => toggle(mode, query, filters)}
      >
        {saved ? 'Saved search' : 'Save search'}
      </Button>
      {(error || loadError) && <Typography color="error">{error || loadError}</Typography>}
    </>
  );
};

export default SaveSearchButton;
