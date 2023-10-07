import React, { ReactElement, useState, useEffect } from 'react';
import { get } from '../../utils/call';
import Grid from '@material-ui/core/Grid';
import { makeStyles, Box, Typography, List, Link, Card, CardContent } from '@material-ui/core';
import { CardData } from '../../App';
import { Link as RouterLink } from 'react-router-dom';
import { colors } from '../../colors';
import HeartRating from '../utils/HeartRating';
import { ReviewWithId, ApartmentWithId } from '../../../../common/types/db-types';
import { getAverageRating } from '../../utils/average';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';

type Props = {
  readonly info: CardData[];
  readonly title: string;
};

type CardProps = {
  readonly buildingData: ApartmentWithId;
  readonly numReviews: number;
  readonly company?: string;
};

const useStyles = makeStyles({
  aptNameTxt: {
    fontWeight: 700,
  },
  card: {
    borderRadius: '10px',
    backgroundColor: colors.red6,
    cursor: 'pointer', // Add cursor pointer to make it clickable
  },
  reviewNum: {
    fontWeight: 700,
    marginLeft: '10px',
  },
});

const PropertyCard = ({ buildingData, numReviews, company }: CardProps): ReactElement => {
  const { aptNameTxt, card, reviewNum } = useStyles();
  const { id, name, address } = buildingData;
  const [reviewData, setReviewData] = useState<ReviewWithId[]>([]);

  /**
   * Handles clicking on the Apartment card. Scrolls up on the window, upward
   * to reach the top with a smooth behavior. The top is defined as 0 since this is
   * where we want to reach.
   */
  const handleCardClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    get<ReviewWithId[]>(`/api/review/aptId/${id}/APPROVED`, {
      callback: setReviewData,
    });
  }, [id]);

  return (
    <Card className={card} onClick={handleCardClick}>
      <CardContent>
        <Grid container direction="row" alignItems="center" justifyContent="space-between">
          <Grid md={12} lg={6} item>
            <Typography className={aptNameTxt}>{name}</Typography>
            <Typography variant="subtitle1">{address}</Typography>
          </Grid>
          <Grid md={12} lg={6} item direction="row" alignItems="center" spacing={2}>
            <Box display="flex" alignItems="center">
              <HeartRating value={getAverageRating(reviewData)} precision={0.5} readOnly />
              <Typography className={reviewNum}>{numReviews}</Typography>
              <KeyboardArrowRightIcon />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const PropertyInfo = ({ info, title }: Props): ReactElement => {
  return (
    <Box mt={2} mb={1}>
      <Typography variant="h6">{title}</Typography>
      <List dense component="ul">
        <Grid container spacing={0} direction="row">
          {info.length === 0 && <Typography variant="body1">No information available.</Typography>}
          <Grid container spacing={2}>
            {info &&
              info.map(({ buildingData, numReviews, company }, index) => {
                const { id } = buildingData;
                return (
                  <Grid item key={index} xs={12}>
                    <Link
                      {...{
                        to: `/apartment/${id}`,
                        style: { textDecoration: 'none' },
                        component: RouterLink,
                      }}
                    >
                      <PropertyCard
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
        </Grid>
      </List>
    </Box>
  );
};

export default PropertyInfo;
