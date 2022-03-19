import { Box, Container, Typography } from '@material-ui/core';
import React, { ReactElement } from 'react';

// import NotFoundIcon from '../assets/not-found.svg';
// import styles from './NotFoundPage.module.css';

const SearchResultsPage = (): ReactElement => {
  return (
    <Container maxWidth="md">
      <Box pb={3} textAlign="center">
        {/* <img src={NotFoundIcon} alt="CU Apts Logo" className={styles.NotFoundImage} /> */}
        <Typography variant="h5">EMPTY NOW!</Typography>
      </Box>
    </Container>
  );
};

export default SearchResultsPage;
