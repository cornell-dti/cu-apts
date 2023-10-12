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
  const [approvedData, setApprovedData] = useState<ReviewWithId[]>([]);

  type ReviewCount = { count: number };
  const [ctownReviewCount, setCtownReviewCount] = useState<ReviewCount>({ count: 0 });
  const [westReviewCount, setWestReviewCount] = useState<ReviewCount>({ count: 0 });
  const [dtownReviewCount, setDtownReviewCount] = useState<ReviewCount>({ count: 0 });
  const [northReviewCount, setNorthReviewCount] = useState<ReviewCount>({ count: 0 });
  const [toggle, setToggle] = useState(false);

  const { container } = useStyles();

  // calls the APIs and the callback function to set the reviews for each review type
  useEffect(() => {
    const reviewTypes = new Map<string, React.Dispatch<React.SetStateAction<ReviewWithId[]>>>([
      ['PENDING', setPendingData],
      ['DECLINED', setDeclinedData],
      ['APPROVED', setApprovedData],
    ]);
    reviewTypes.forEach((cllbck, reviewType) => {
      get<ReviewWithId[]>(`/api/review/${reviewType}`, {
        callback: cllbck,
      });
    });
  }, [toggle]);

  // sets counts for each location
  useEffect(() => {
    const reviewCounts = new Map<string, React.Dispatch<React.SetStateAction<ReviewCount>>>([
      ['COLLEGETOWN', setCtownReviewCount],
      ['DOWNTOWN', setDtownReviewCount],
      ['WEST', setWestReviewCount],
      ['NORTH', setNorthReviewCount],
    ]);
    reviewCounts.forEach((cllbck, location) => {
      get<ReviewCount>(`/api/review/${location}/count`, {
        callback: cllbck,
      });
    });
  }, [toggle]);

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
            <strong>Review Counts</strong>
          </Typography>
          <ul>
            <li>Total: {approvedData.length}</li>
            <li>Collegetown: {ctownReviewCount.count}</li>
            <li>West: {westReviewCount.count}</li>
            <li>Downtown: {dtownReviewCount.count}</li>
            <li>North: {northReviewCount.count}</li>
          </ul>
        </Grid>
        <Grid item xs={12} sm={12}>
          <Typography variant="h3">
            <strong>Pending Reviews</strong>
          </Typography>
          <Grid container item spacing={3}>
            {sortReviews(pendingData, 'date').map((review, index) => (
              <Grid item xs={12} key={index}>
                <AdminReviewComponent review={review} setToggle={setToggle} />
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
                <AdminReviewComponent review={review} setToggle={setToggle} />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminPage;
