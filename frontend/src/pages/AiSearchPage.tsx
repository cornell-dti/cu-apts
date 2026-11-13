import React, { ReactElement } from 'react';
import { Container, Typography } from '@material-ui/core';
import { useLocation } from 'react-router-dom';
import { useTitle } from '../utils';

/**
 * AiSearchPage – placeholder for AI search results. Currently just shows the query from `?q=`.
 */
const AiSearchPage = (): ReactElement => {
  const query = new URLSearchParams(useLocation().search).get('q') ?? '';
  useTitle('AI Search');

  return (
    <Container maxWidth="xl" style={{ marginTop: '93px' }}>
      <Typography variant="h1" style={{ fontWeight: 600 }}>
        AI Search
      </Typography>
      <Typography>Query: {query}</Typography>
    </Container>
  );
};

export default AiSearchPage;
