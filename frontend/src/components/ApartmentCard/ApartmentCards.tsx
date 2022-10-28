import React, { ReactElement } from 'react';
import ApartmentCard from './ApartmentCard';
import { Grid, Link, makeStyles } from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import { CardData } from '../../App';

type Props = {
  data: CardData[];
};

const useStyles = makeStyles({
  boundingBox: {
    marginTop: '2em',
    marginBottom: '2em',
  },
});

const ApartmentCards = ({ data }: Props): ReactElement => {
  const { boundingBox } = useStyles();

  return (
    <Grid container spacing={3} className={boundingBox}>
      {data &&
        data.map(({ buildingData, numReviews, company }, index) => {
          const { id } = buildingData;
          return (
            <Grid item md={12} key={index}>
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
