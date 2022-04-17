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
    <Grid container spacing={3}>
      {data &&
        data.map(({ buildingData, numReviews, company }, index) => {
          const { id } = buildingData;
          return (
            <Grid item key={index}>
              <Link
                {...{
                  to: `/apartment/${id}`,
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
