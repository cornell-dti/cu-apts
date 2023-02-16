import React, { ReactElement, useEffect, useState } from 'react';
import { Box, Container, Typography, makeStyles } from '@material-ui/core';
import { get } from '../utils/call';
import ApartmentCards from '../components/ApartmentCard/ApartmentCards';
import { CardData } from '../App';

const ReviewPage = (): ReactElement => {
  const useStyles = makeStyles({
    rentingBox: {
      marginTop: '3em',
      marginBottom: '2em',
    },
    rentingText: {
      fontWeight: 500,
    },
  });

  const classes = useStyles();
  const [aptData, setAptData] = useState<CardData[]>([]);

  useEffect(() => {
    get<CardData[]>(`/page-data/reviews/12`, {
      callback: setAptData,
    });
  }, []);

  return (
    <Container maxWidth="lg">
      <Box pb={3} textAlign="left" className={classes.rentingBox}>
        <Typography variant="h4" className={classes.rentingText}>
          Reviews By Renting Company
        </Typography>
      </Box>
      <ApartmentCards data={aptData} />
    </Container>
  );
};

export default ReviewPage;
