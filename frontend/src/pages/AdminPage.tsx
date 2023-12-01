import React, { ReactElement, useEffect, useState } from 'react';
import { Typography, makeStyles, Grid, Container } from '@material-ui/core';
import { ReviewWithId } from '../../../common/types/db-types';
import { get } from '../utils/call';
import AdminReviewComponent from '../components/Admin/AdminReview';
import { useTitle } from '../utils';
import { Chart } from 'react-google-charts';
import { sortReviews } from '../utils/sortReviews';

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

  useTitle('Admin');

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

  const pieChartData = [
    ['Location', 'Review Count'],
    ['Collegetown', ctownReviewCount.count],
    ['West', westReviewCount.count],
    ['Downtown', dtownReviewCount.count],
    ['North', northReviewCount.count],
  ];

  return (
    <Container className={container}>
      <Grid container spacing={5} justifyContent="center">
        <Grid container>
          <Grid item xs={12} sm={6}>
            <Typography variant="h3" style={{ margin: '10px' }}>
              <strong>Review Counts</strong>
            </Typography>
            <ul style={{ fontSize: '18px', marginLeft: '5%' }}>
              <li>Total: {approvedData.length}</li>
              <li>Collegetown: {ctownReviewCount.count}</li>
              <li>West: {westReviewCount.count}</li>
              <li>Downtown: {dtownReviewCount.count}</li>
              <li>North: {northReviewCount.count}</li>
            </ul>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Chart
              chartType="PieChart"
              data={pieChartData}
              options={{
                title: 'Reviews Breakdown',
              }}
              width={'100%'}
              height={'400px'}
            />
          </Grid>
        </Grid>

        <Grid container>
          <Typography variant="h3" style={{ margin: '10px' }}>
            <strong>Pending Reviews ({pendingData.length})</strong>
          </Typography>
          <Grid container item spacing={3}>
            {sortReviews(pendingData, 'date').map((review, index) => (
              <Grid item xs={12} key={index}>
                <AdminReviewComponent
                  review={review}
                  setToggle={setToggle}
                  declinedSection={false}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid container>
          <Grid item xs={12} sm={12}>
            <Typography variant="h3" style={{ margin: '10px' }}>
              <strong>Declined Reviews ({declinedData.length})</strong>
            </Typography>
            <Grid container item spacing={3}>
              {sortReviews(declinedData, 'date').map((review, index) => (
                <Grid item xs={12} key={index}>
                  <AdminReviewComponent
                    review={review}
                    setToggle={setToggle}
                    declinedSection={true}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminPage;
