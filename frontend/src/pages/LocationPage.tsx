import React, { ReactElement } from 'react';
import { Box, Container, Typography } from '@material-ui/core';
import styles from './HomePage.module.scss';
import { LocationCardData } from '../App';

type Props = {
  data: LocationCardData[];
};

const LocationPage = ({ data }: Props): ReactElement => {
  return (
    <>
      <Box className={styles.JumboTron}>
        <Container maxWidth="lg">
          <Typography>Hello</Typography>
        </Container>
      </Box>
    </>
  );
};
export default LocationPage;
