import React, { ReactElement, useEffect, useState } from 'react';
import { Box, Container, Typography, makeStyles } from '@material-ui/core';
import get from '../utils/get';
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
  const [buildingData, setBuildingData] = useState<CardData[]>([]);

  useEffect(() => {
    get<any>(`/page-data/reviews`, {
      callback: setBuildingData,
    });
  }, []);

  return (
    <Container maxWidth="lg">
      <Box pb={3} textAlign="left" className={classes.rentingBox}>
        <Typography variant="h4" className={classes.rentingText}>
          Reviews By Renting Company
        </Typography>
      </Box>
      <ApartmentCards data={buildingData} />
    </Container>
  );
};

export default ReviewPage;
