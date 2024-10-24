import React, { ReactElement, useEffect, useState } from 'react';
import {
  Typography,
  makeStyles,
  Grid,
  Container,
  List,
  ListItem,
  ListItemText,
  AppBar,
  Toolbar,
  Tabs,
  Tab,
} from '@material-ui/core';
import { CantFindApartmentForm, QuestionForm, ReviewWithId } from '../../../common/types/db-types';
import { get } from '../utils/call';
import AdminReviewComponent from '../components/Admin/AdminReview';
import { useTitle } from '../utils';
import { Chart } from 'react-google-charts';
import { sortReviews } from '../utils/sortReviews';
import PhotoCarousel from '../components/PhotoCarousel/PhotoCarousel';

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: '20px',
  },
}));

/**
 * AdminPage Component
 *
 * This component represents a page that only authorized admins can view. The page displays information about reviews, allows admins
 * to approve or decline reviews. The page also displays contact information from the contact modals ("Can't Find Your Apartment" form
 * and "Ask Us a Question" form).
 *
 * @returns The rendered AdminPage component.
 */
const AdminPage = (): ReactElement => {
  const [selectedTab, setSelectedTab] = useState('Reviews');

  const [pendingData, setPendingData] = useState<ReviewWithId[]>([]);
  const [declinedData, setDeclinedData] = useState<ReviewWithId[]>([]);
  const [approvedData, setApprovedData] = useState<ReviewWithId[]>([]);

  type ReviewCount = { count: number };
  const [ctownReviewCount, setCtownReviewCount] = useState<ReviewCount>({ count: 0 });
  const [westReviewCount, setWestReviewCount] = useState<ReviewCount>({ count: 0 });
  const [dtownReviewCount, setDtownReviewCount] = useState<ReviewCount>({ count: 0 });
  const [northReviewCount, setNorthReviewCount] = useState<ReviewCount>({ count: 0 });
  const [toggle, setToggle] = useState(false);

  const [pendingApartment, setPendingApartmentData] = useState<CantFindApartmentForm[]>([]);
  const [pendingContactQuestions, setPendingContactQuestions] = useState<QuestionForm[]>([]);

  const [carouselOpen, setCarouselOpen] = useState(false);
  const [carouselPhotos, setCarouselPhotos] = useState<readonly string[]>([]);
  const [carouselStartIndex, setCarouselStartIndex] = useState<number>(0);

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

  useEffect(() => {
    const apartmentTypes = new Map<
      string,
      React.Dispatch<React.SetStateAction<CantFindApartmentForm[]>>
    >([['PENDING', setPendingApartmentData]]);
    apartmentTypes.forEach((cllbck, apartmentType) => {
      get<CantFindApartmentForm[]>(`/api/pending-buildings/${apartmentType}`, {
        callback: cllbck,
      });
    });
  }, [toggle]);

  useEffect(() => {
    const questionTypes = new Map<string, React.Dispatch<React.SetStateAction<QuestionForm[]>>>([
      ['PENDING', setPendingContactQuestions],
    ]);
    questionTypes.forEach((cllbck, questionType) => {
      get<QuestionForm[]>(`/api/contact-questions/${questionType}`, {
        callback: cllbck,
      });
    });
  }, [toggle]);

  /**
   * showPhotoCarousel – Opens the photo carousel modal with the provided photos and start index.
   *
   * @remarks
   * This function sets the photos and start index for the photo carousel and then opens the carousel modal.
   * If no photos are provided, it defaults to no photos.
   *
   * @param {readonly string[]} [photos] – The array of photo URLs to display in the carousel.
   * @param {number} [startIndex] – The index of the photo to start the carousel from.
   * @return {void} – This function does not return anything.
   */
  const showPhotoCarousel = (photos: readonly string[] = [], startIndex: number = 0) => {
    setCarouselPhotos(photos);
    setCarouselStartIndex(startIndex);
    setCarouselOpen(true);
  };

  const Modals = (
    <>
      <PhotoCarousel
        photos={carouselPhotos}
        open={carouselOpen}
        onClose={() => setCarouselOpen(false)}
        startIndex={carouselStartIndex}
      />
    </>
  );

  //  Reviews tab
  const reviews = (
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
                  triggerPhotoCarousel={showPhotoCarousel}
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
                    triggerPhotoCarousel={showPhotoCarousel}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );

  //  Contact tab
  const contact = (
    <Container className={container}>
      <Grid container>
        <Typography variant="h3" style={{ margin: '10px' }}>
          <strong>Pending "Can't Find Your Apartment" Data ({pendingApartment.length})</strong>
        </Typography>
        {[...pendingApartment]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map((apartment, index) => (
            <ListItem key={index}>
              <List>
                <ListItemText>Date: {apartment.date}</ListItemText>
                <ListItemText>Apartment name: {apartment.name}</ListItemText>
                <ListItemText>Apartment Address: {apartment.address}</ListItemText>
                <ListItemText>Photos: {apartment.photos}</ListItemText>
              </List>
            </ListItem>
          ))}
      </Grid>

      <Grid container>
        <Grid item xs={12} sm={12}>
          <Typography variant="h3" style={{ margin: '10px' }}>
            <strong>Contact Questions ({pendingContactQuestions.length})</strong>
          </Typography>
          {[...pendingContactQuestions]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((question, index) => (
              <ListItem key={index}>
                <List>
                  <ListItemText>Date: {question.date}</ListItemText>
                  <ListItemText>User name: {question.name}</ListItemText>
                  <ListItemText>Cornell Email: {question.email}</ListItemText>
                  <ListItemText>Msg: {question.msg}</ListItemText>
                </List>
              </ListItem>
            ))}
        </Grid>
      </Grid>
    </Container>
  );

  return (
    <div>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Tabs
            value={selectedTab}
            onChange={(event, newValue) => setSelectedTab(newValue)}
            aria-label="navigation tabs"
            variant="fullWidth"
          >
            <Tab label="Reviews" value="Reviews" />
            <Tab label="Contact" value="Contact" />
          </Tabs>
        </Toolbar>
      </AppBar>

      {selectedTab === 'Reviews' && reviews}
      {selectedTab === 'Contact' && contact}
      {Modals}
    </div>
  );
};

export default AdminPage;
