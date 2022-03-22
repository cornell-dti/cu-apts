import { Box, Container, Typography } from '@material-ui/core';
import React, { ReactElement } from 'react';
import { useSearchParams } from 'react-router-dom';

const SearchResultsPage = (): ReactElement => {
  const [searchParams, setSearchParams] = useSearchParams();
  return (
    <Container maxWidth="md">
      <Box pb={3} textAlign="center">
        {/* <img src={NotFoundIcon} alt="CU Apts Logo" className={styles.NotFoundImage} /> */}
        <Typography variant="h5">EMPTY NOW! showing results for {searchParams.get('q')}</Typography>
      </Box>
    </Container>
  );
};

export default SearchResultsPage;
