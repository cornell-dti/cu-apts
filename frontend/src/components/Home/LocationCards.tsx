import React, { ReactElement } from 'react';
import LocationCard from './LocationCard';
import { Grid, Link } from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import { LocationCardData } from '../../App';
import CollegetownImg from '../../assets/collegetown-coverpic.svg';
import WestImg from '../../assets/west-coverpic.svg';
import NorthImg from '../../assets/north-coverpic.svg';
import DowntownImg from '../../assets/downtown-coverpic.svg';

const locationData: LocationCardData[] = [
  {
    photo: CollegetownImg,
    location: 'Collegetown',
  },
  {
    photo: WestImg,
    location: 'West',
  },
  {
    photo: NorthImg,
    location: 'North',
  },
  {
    photo: DowntownImg,
    location: 'Downtown',
  },
];

const LocationCards = (): ReactElement => {
  const data = locationData;
  return (
    <Grid container spacing={5}>
      {data &&
        data.map(({ photo, location }, index) => {
          return (
            <Grid item xs={6} sm={6} md={3} key={index}>
              <Link
                {...{
                  to: `/location/${location}`,
                  style: { textDecoration: 'none' },
                  component: RouterLink,
                }}
              >
                <LocationCard key={index} photo={photo} location={location} />
              </Link>
            </Grid>
          );
        })}
    </Grid>
  );
};

export default LocationCards;
