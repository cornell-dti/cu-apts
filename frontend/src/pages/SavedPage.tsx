import React, { useEffect, useState } from 'react';
import { Box, Container, Typography } from '@material-ui/core';
import firebase from 'firebase/app';
import ApartmentCards from '../components/ApartmentCard/ApartmentCards';
import { get } from '../utils/call';
import { CardData } from '../App';

type Props = {
  user: firebase.User | null;
  setUser: React.Dispatch<React.SetStateAction<firebase.User | null>>;
};

const SavedPage = ({ user, setUser }: Props) => {
  const [data, setData] = useState<CardData[]>([]);
  const savedAPI = '/api/location/West/';

  useEffect(() => {
    get<CardData[]>(savedAPI, {
      callback: setData,
    });
  }, [savedAPI]);

  return (
    <Container>
      <Typography>Saved Properties and Landlords ({data.length})</Typography>
      <ApartmentCards data={data} />
    </Container>
  );
};

export default SavedPage;
