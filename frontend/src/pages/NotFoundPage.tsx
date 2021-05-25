import { Box, Container, Typography } from '@material-ui/core';
import React, { ReactElement } from 'react';
import NotFoundIcon from '../assets/not-found.svg';
import styles from './NotFoundPage.module.css';

const NotFoundPage = (): ReactElement => {
  return (
    <Container maxWidth="md">
      <Box pb={3} textAlign="center">
        <img src={NotFoundIcon} alt="CU Apts Logo" className={styles.NotFoundImage} />
        <Typography variant="h5">
          It seems as though the page you are looking for cannot be found!
        </Typography>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
