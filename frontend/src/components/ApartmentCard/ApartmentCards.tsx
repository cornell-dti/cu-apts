import React, { ReactElement } from 'react';
import ApartmentCard from './ApartmentCard';
import { Grid, Link } from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import { CardData } from '../../App';

type Props = {
  data: CardData[];
};

const ApartmentCards = ({ data }: Props): ReactElement => {
  return (
    <Grid container spacing={8}>
      {data &&
        data.map(({ buildingData, numReviews, company }, index) => {
          const { landlordId } = buildingData;
          return (
            <Grid item xs={12} md={4} key={index}>
              <Link
                {...{
                  to: `/landlord/${landlordId}`,
                  style: { textDecoration: 'none' },
                  component: RouterLink,
                }}
              >
                <ApartmentCard
                  key={index}
                  numReviews={numReviews}
                  buildingData={buildingData}
                  company={company}
                />
              </Link>
            </Grid>
          );
        })}
    </Grid>
  );
};

export default ApartmentCards;
