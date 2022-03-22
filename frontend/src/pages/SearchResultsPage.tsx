import { Box, Container, Typography } from '@material-ui/core';
import React, { ReactElement } from 'react';

const SearchResultsPage = (): ReactElement => {
  return (
    <Container maxWidth="md">
      <Box pb={3} textAlign="center">
        <Typography variant="h5">EMPTY NOW! </Typography>
      </Box>
    </Container>
  );
};

export default SearchResultsPage;
