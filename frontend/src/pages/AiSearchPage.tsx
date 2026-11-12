import React, { ReactElement, useEffect } from 'react';
import { Container, Typography } from '@material-ui/core';
import { useLocation } from 'react-router-dom';
import { useTitle } from '../utils';
import SaveSearchButton from '../components/Search/SaveSearchButton';
import { defaultFilters } from '../components/Search/FilterSection';
import { recordSearch } from '../utils/savedSearches';

/**
 * AiSearchPage – placeholder for AI search results. Currently just shows the query from `?q=`.
 */
const AiSearchPage = ({
  user,
  setUser,
}: {
  user: firebase.User | null;
  setUser: React.Dispatch<React.SetStateAction<firebase.User | null>>;
}): ReactElement => {
  const query = new URLSearchParams(useLocation().search).get('q') ?? '';
  useTitle('AI Search');

  useEffect(() => {
    recordSearch('ai', query, defaultFilters, user?.uid);
  }, [query, user?.uid]);

  return (
    <Container maxWidth="xl" style={{ marginTop: '93px' }}>
      <Typography variant="h1" style={{ fontWeight: 600 }}>
        AI Search
      </Typography>
      <Typography>Query: {query}</Typography>
      <SaveSearchButton
        mode="ai"
        query={query}
        filters={defaultFilters}
        user={user}
        setUser={setUser}
      />
    </Container>
  );
};

export default AiSearchPage;
