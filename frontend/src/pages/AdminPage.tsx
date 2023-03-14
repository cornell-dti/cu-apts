import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { Typography, makeStyles, Grid, Container } from '@material-ui/core';
import { ReviewWithId } from '../../../common/types/db-types';
import { get } from '../utils/call';
import AdminReviewComponent from '../components/Admin/AdminReview';

// const useStyles = makeStyles(() => ({
//   approveButton: {
//     fontFamily: 'Work Sans, sans-serif',
//     size: '100px',
//     fontSize: '40px',
//     lineHeight: '70px',
//     letterSpacing: '0.01em',
//     textTransform: 'none',
//     background: '#5aa17f',
//   },
//   rejectButton: {
//     fontFamily: 'Work Sans, sans-serif',
//     size: '100px',
//     fontSize: '40px',
//     lineHeight: '70px',
//     letterSpacing: '0.01em',
//     textTransform: 'none',
//     marginLeft: '40px',
//     background: '#FF8A8A',
//   },
// }));

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
          <Typography>Pending Reviews</Typography>
          <Grid container item spacing={3}>
            {sortReviews(pendingData, 'date').map((review, index) => (
              <Grid item xs={12} key={index}>
                <AdminReviewComponent review={review} />
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12} sm={12}>
          <Typography>Declined Reviews</Typography>
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
