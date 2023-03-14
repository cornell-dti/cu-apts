import React, { ReactElement, useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  Button,
  Collapse,
  Link,
  createTheme,
  ThemeProvider,
} from '@material-ui/core';
import HeartRating from '../utils/HeartRating';
import { format } from 'date-fns';
import { makeStyles } from '@material-ui/styles';
import DetailedRatings from '../Review/DetailedRating';
import { ApartmentWithId, Landlord, ReviewWithId } from '../../../../common/types/db-types';
import { colors } from '../../colors';
import { get } from '../../utils/call';
import { Link as RouterLink } from 'react-router-dom';

type Props = {
  readonly review: ReviewWithId;
};

const useStyles = makeStyles(() => ({
  root: {
    borderRadius: '10px',
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    borderColor: colors.black,
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  dateText: {
    color: colors.gray1,
  },
  button: {
    textTransform: 'none',
    '&.Mui-disabled': {
      color: 'inherit',
    },
  },
}));

const muiTheme = createTheme({
  palette: { primary: { main: colors.green1 }, secondary: { main: colors.red1 } },
});

const AdminReviewComponent = ({ review }: Props): ReactElement => {
  const { detailedRatings, overallRating, date, reviewText, photos } = review;
  const formattedDate = format(new Date(date), 'MMM dd, yyyy').toUpperCase();
  const { root, dateText } = useStyles();
  const [apt, setApt] = useState<ApartmentWithId[]>([]);
  const [landlord, setLandlord] = useState<Landlord>();

  useEffect(() => {
    if (review.aptId !== null) {
      get<ApartmentWithId[]>(`/apts/${review.aptId}`, {
        callback: setApt,
      });
    }
    get<Landlord>(`/landlord/${review.landlordId}`, {
      callback: setLandlord,
    });
  }, [review]);

  const changeStatus = (new_status: string) => {
    // Implement button
  };

  return (
    <Card className={root} variant="outlined">
      <Box minHeight="200px">
        <CardContent>
          <Grid container spacing={2}>
            <Grid item container justifyContent="space-between">
              <Grid item>
                <HeartRating value={overallRating} readOnly />
              </Grid>
              <Grid>
                {apt.length > 0 ? (
                  <Link
                    {...{
                      to: `/apts/${review.aptId}`,
                      style: { textDecoration: 'none' },
                      component: RouterLink,
                    }}
                  >
                    {apt[0].name}
                  </Link>
                ) : (
                  <Link
                    {...{
                      to: `/landlord/${review.landlordId}`,
                      style: { textDecoration: 'none' },
                      component: RouterLink,
                    }}
                  >
                    {landlord?.name}
                  </Link>
                )}
              </Grid>

              <Grid item>
                <Typography className={dateText}>{formattedDate}</Typography>
              </Grid>

              <Grid item>
                <Collapse in={true} timeout="auto" unmountOnExit>
                  <CardContent>
                    <DetailedRatings ratings={detailedRatings} />
                  </CardContent>
                </Collapse>
              </Grid>

              <Grid item container alignContent="center">
                <Typography>{reviewText}</Typography>
              </Grid>

              {photos.length > 0 && (
                <Grid container alignItems="center" justifyContent="center">
                  <Grid item xs={12} sm={6}>
                    <CardMedia
                      component="img"
                      alt="Apt image"
                      image={photos[0]}
                      title="Apt image"
                    />
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Box>

      <CardActions>
        <Grid item container direction="row" justifyContent="flex-end" alignItems="flex-end">
          <ThemeProvider theme={muiTheme}>
            <Grid item>
              <Button onClick={() => changeStatus('APPROVED')} variant="contained" color="primary">
                Approve
              </Button>
            </Grid>
            <Grid item>
              <Button onClick={() => changeStatus('DECLINED')} variant="outlined" color="secondary">
                Decline
              </Button>
            </Grid>
          </ThemeProvider>
        </Grid>
      </CardActions>
    </Card>
  );
};

export default AdminReviewComponent;
