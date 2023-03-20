import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { Typography, makeStyles, Grid, Container } from '@material-ui/core';
import { ReviewWithId } from '../../../common/types/db-types';
import { get } from '../utils/call';
import AdminReviewComponent from '../components/Admin/AdminReview';

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: '20px',
  },
}));

const AdminPage = (): ReactElement => {
  const [pendingData, setPendingData] = useState<ReviewWithId[]>([]);
  const [declinedData, setDeclinedData] = useState<ReviewWithId[]>([]);
  const { container } = useStyles();

  useEffect(() => {
    get<ReviewWithId[]>(`/review/PENDING`, {
      callback: setPendingData,
    });
  }, []);

  useEffect(() => {
    get<ReviewWithId[]>(`/review/DECLINED`, {
      callback: setDeclinedData,
    });
  }, []);

  type Fields = keyof ReviewWithId;
  const sortReviews = useCallback((arr: ReviewWithId[], property: Fields) => {
    let unsorted = arr;
    return unsorted.sort((r1, r2) => {
      const first = r1?.[property] === undefined ? 0 : r1?.[property];
      const second = r2?.[property] === undefined ? 0 : r2?.[property];
      // @ts-ignore: Object possibly null or undefined
      return first < second ? 1 : -1;
    });
  }, []);

  return (
    <Container className={container}>
      <Grid container spacing={5} justifyContent="center">
        <Grid item xs={12} sm={12}>
          <Typography variant="h3">
            <strong>Pending Reviews</strong>
          </Typography>
          <Grid container item spacing={3}>
            {sortReviews(pendingData, 'date').map((review, index) => (
              <Grid item xs={12} key={index}>
                <AdminReviewComponent review={review} />
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12} sm={12}>
          <Typography variant="h3">
            <strong>Declined Reviews</strong>
          </Typography>
          <Grid container item spacing={3}>
            {sortReviews(declinedData, 'date').map((review, index) => (
              <Grid item xs={12} key={index}>
                <AdminReviewComponent review={review} />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminPage;
