import React, { ReactElement } from 'react';
import { Box, Container, Typography, makeStyles } from '@material-ui/core';
import styles from './HomePage.module.scss';
import { colors } from '../colors';
import { LocationCardData } from '../App';

type Props = {
  data: LocationCardData[];
};

const useStyles = makeStyles({
  jumboText: {
    color: colors.white,
    fontWeight: 600,
    margin: '0.5em 0 0.5em 0',
  },
  jumboSub: {
    color: colors.white,
    fontWeight: 400,
  },
  rentingBox: {
    marginTop: '2em',
    marginBottom: '2em',
  },
  rentingText: {
    marginBottom: '1em',
    fontWeight: 500,
    color: colors.red1,
  },
});

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
