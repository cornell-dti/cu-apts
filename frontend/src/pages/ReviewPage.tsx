import React, { ReactElement, useEffect, useState } from 'react';
import { Box, Container, Typography, makeStyles } from '@material-ui/core';
import { get } from '../utils/call';
import ApartmentCards from '../components/ApartmentCard/ApartmentCards';
import { CardData } from '../App';
import firebase from '../utils/firebase';

type Props = {
  user: firebase.User | null;
  setUser: React.Dispatch<React.SetStateAction<firebase.User | null>>;
};

const ReviewPage = ({ user, setUser }: Props): ReactElement => {
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
    get<CardData[]>(`/api/page-data/reviews/12`, {
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
      <ApartmentCards user={user} setUser={setUser} data={aptData} />
    </Container>
  );
};

export default ReviewPage;
