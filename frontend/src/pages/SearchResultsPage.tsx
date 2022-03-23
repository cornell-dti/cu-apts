import { Box, Container, Typography } from '@material-ui/core';
import React, { ReactElement } from 'react';
import { useLocation } from 'react-router-dom';

const SearchResultsPage = (): ReactElement => {
  const location = useLocation();
  return (
    <Container maxWidth="md">
      <Box pb={3} textAlign="center">
        <Typography variant="h5">EMPTY NOW! {location.search.substring(3)}</Typography>
      </Box>
    </Container>
  );
};

export default SearchResultsPage;
