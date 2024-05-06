import React, { ReactElement, useEffect, useState } from 'react';
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

/**
 * LocationCards Component
 *
 * Renders a grid of location cards, each representing a different location.
 * The location cards display an image and a link to navigate to the specific location.
 *
 * @returns A ReactElement representing the LocationCards component.
 */
const LocationCards = (): ReactElement => {
  const data = locationData;
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Grid style={{ marginLeft: isMobile ? 0 : '13px', marginRight: isMobile ? 0 : '13px' }}>
      <Grid container spacing={4}>
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
    </Grid>
  );
};

export default LocationCards;
