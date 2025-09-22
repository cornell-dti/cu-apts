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
  IconButton,
} from '@material-ui/core';
import {
  CantFindApartmentFormWithId,
  QuestionFormWithId,
  ReviewWithId,
  ApartmentWithId,
} from '../../../common/types/db-types';
import { get } from '../utils/call';
import AdminReviewComponent from '../components/Admin/AdminReview';
import { useTitle } from '../utils';
import { Chart } from 'react-google-charts';
import { sortReviews } from '../utils/sortReviews';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import clsx from 'clsx';
import { colors } from '../colors';
import PhotoCarousel from '../components/PhotoCarousel/PhotoCarousel';
import usePhotoCarousel from '../components/PhotoCarousel/usePhotoCarousel';
import AdminCantFindApt from '../components/Admin/AdminCantFindApt';
import AdminContactQuestion from '../components/Admin/AdminContactQuestion';

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: '20px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    width: '30%',
    justifyContent: 'space-between',
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: theme.spacing(1),
    transition: theme.transitions.create('transform', {
      duration: 150,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
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
  const [pendingApartment, setPendingApartmentData] = useState<CantFindApartmentFormWithId[]>([]);
  const [pendingContactQuestions, setPendingContactQuestions] = useState<QuestionFormWithId[]>([]);
  const [pendingExpanded, setPendingExpanded] = useState(true);
  const [declinedExpanded, setDeclinedExpanded] = useState(true);
  const [reportedData, setReportedData] = useState<ReviewWithId[]>([]);
  const [reportedExpanded, setReportedExpanded] = useState(true);
  const [apartments, setApartments] = useState<any[]>([]);

  // Debug apartments state changes
  useEffect(() => {
    console.log('Apartments loaded:', apartments.length);
  }, [apartments]);
  const { container, sectionHeader, expand, expandOpen } = useStyles();
  const {
    carouselPhotos,
    carouselStartIndex,
    carouselOpen,
    showPhotoCarousel,
    closePhotoCarousel,
  } = usePhotoCarousel([]);

  useTitle('Admin');

  // calls the APIs and the callback function to set the reviews for each review type
  useEffect(() => {
    const reviewTypes = new Map<string, React.Dispatch<React.SetStateAction<ReviewWithId[]>>>([
      ['REPORTED', setReportedData],
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
      React.Dispatch<React.SetStateAction<CantFindApartmentFormWithId[]>>
    >([['PENDING', setPendingApartmentData]]);
    apartmentTypes.forEach((cllbck, apartmentType) => {
      get<CantFindApartmentFormWithId[]>(`/api/pending-buildings/${apartmentType}`, {
        callback: cllbck,
      });
    });
  }, [toggle]);

  useEffect(() => {
    const questionTypes = new Map<
      string,
      React.Dispatch<React.SetStateAction<QuestionFormWithId[]>>
    >([['PENDING', setPendingContactQuestions]]);
    questionTypes.forEach((cllbck, questionType) => {
      get<QuestionFormWithId[]>(`/api/contact-questions/${questionType}`, {
        callback: cllbck,
      });
    });
  }, [toggle]);

  // Load all apartments data
  useEffect(() => {
    get<any>(`/api/page-data/home/1000/numReviews`, {
      callback: (data) => {
        if (data && data.buildingData && Array.isArray(data.buildingData)) {
          setApartments(data.buildingData);
        } else {
          console.error('Failed to load apartments data');
        }
      },
    });
  }, []);

  const Modals = (
    <>
      <PhotoCarousel
        photos={carouselPhotos}
        open={carouselOpen}
        onClose={closePhotoCarousel}
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
          <div className={sectionHeader}>
            <Typography variant="h3" style={{ margin: '10px' }}>
              <strong>Reported Reviews ({reportedData.length})</strong>
            </Typography>
            <IconButton
              className={clsx(expand, {
                [expandOpen]: reportedExpanded,
              })}
              onClick={() => setReportedExpanded(!reportedExpanded)}
              aria-expanded={reportedExpanded}
              aria-label="show reported reviews"
            >
              <ExpandMoreIcon htmlColor={colors.red1} />
            </IconButton>
          </div>
          {reportedExpanded && (
            <Grid container item spacing={3}>
              {sortReviews(reportedData, 'date').map((review, index) => (
                <Grid item xs={12} key={index}>
                  <AdminReviewComponent
                    review={review}
                    setToggle={setToggle}
                    showIgnore={true}
                    showDelete={true}
                    triggerPhotoCarousel={showPhotoCarousel}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>

        <Grid container>
          <div className={sectionHeader}>
            <Typography variant="h3" style={{ margin: '10px' }}>
              <strong>Pending Reviews ({pendingData.length})</strong>
            </Typography>
            <IconButton
              className={clsx(expand, {
                [expandOpen]: pendingExpanded,
              })}
              onClick={() => setPendingExpanded(!pendingExpanded)}
              aria-expanded={pendingExpanded}
              aria-label="show pending reviews"
            >
              <ExpandMoreIcon htmlColor={colors.red1} />
            </IconButton>
          </div>
          {pendingExpanded && (
            <Grid container item spacing={3}>
              {sortReviews(pendingData, 'date').map((review, index) => (
                <Grid item xs={12} key={index}>
                  <AdminReviewComponent
                    review={review}
                    setToggle={setToggle}
                    showDecline={true}
                    showApprove={true}
                    triggerPhotoCarousel={showPhotoCarousel}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>

        <Grid container>
          <div className={sectionHeader}>
            <Typography variant="h3" style={{ margin: '10px' }}>
              <strong>Declined Reviews ({declinedData.length})</strong>
            </Typography>
            <IconButton
              className={clsx(expand, {
                [expandOpen]: declinedExpanded,
              })}
              onClick={() => setDeclinedExpanded(!declinedExpanded)}
              aria-expanded={declinedExpanded}
              aria-label="show declined reviews"
            >
              <ExpandMoreIcon htmlColor={colors.red1} />
            </IconButton>
          </div>
          {declinedExpanded && (
            <Grid container item spacing={3}>
              {sortReviews(declinedData, 'date').map((review, index) => (
                <Grid item xs={12} key={index}>
                  <AdminReviewComponent
                    review={review}
                    setToggle={setToggle}
                    showDelete={true}
                    showApprove={true}
                    triggerPhotoCarousel={showPhotoCarousel}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Container>
  );

  //  Contact tab
  const contact = (
    <Container className={container}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h3" style={{ margin: '10px', marginBottom: '30px' }}>
            <strong>Pending "Can't Find Your Apartment" Data ({pendingApartment.length})</strong>
          </Typography>
          {[...pendingApartment]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((apartment, index) => (
              <Grid item xs={12} key={index} style={{ marginBottom: '20px' }}>
                <AdminCantFindApt
                  pending_building_id={apartment.id}
                  date={apartment.date}
                  apartmentName={apartment.name}
                  apartmentAddress={apartment.address}
                  photos={apartment.photos}
                  triggerPhotoCarousel={showPhotoCarousel}
                  setToggle={setToggle}
                />
              </Grid>
            ))}
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h3" style={{ margin: '10px', marginBottom: '30px' }}>
            <strong>Contact Questions ({pendingContactQuestions.length})</strong>
          </Typography>
          {[...pendingContactQuestions]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((question, index) => (
              <Grid item xs={12} key={index} style={{ marginBottom: '20px' }}>
                <AdminContactQuestion
                  question_id={question.id}
                  date={question.date}
                  name={question.name}
                  email={question.email}
                  msg={question.msg}
                  setToggle={setToggle}
                />
              </Grid>
            ))}
        </Grid>
      </Grid>
    </Container>
  );

  //  Data tab
  const data = (
    <Container className={container}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h3" style={{ margin: '10px', marginBottom: '30px' }}>
            <strong>All Apartments ({apartments.length})</strong>
          </Typography>
          <List>
            {apartments.map((apartment, index) => (
              <ListItem
                key={index}
                style={{ borderBottom: '1px solid #e0e0e0', padding: '15px 0' }}
              >
                <ListItemText
                  primary={
                    <Typography variant="h6" style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                      {apartment.buildingData?.name || 'N/A'}
                    </Typography>
                  }
                  secondary={
                    <div>
                      <Typography variant="body1" style={{ marginBottom: '3px' }}>
                        <strong>Address:</strong> {apartment.buildingData?.address || 'N/A'}
                      </Typography>
                      <Typography variant="body1" style={{ marginBottom: '3px' }}>
                        <strong>Location:</strong> {apartment.buildingData?.area || 'N/A'}
                      </Typography>
                      <Typography variant="body1" style={{ marginBottom: '3px' }}>
                        <strong>Bedrooms:</strong> {apartment.buildingData?.numBeds || 'N/A'}
                      </Typography>
                      <Typography variant="body1" style={{ marginBottom: '3px' }}>
                        <strong>Bathrooms:</strong> {apartment.buildingData?.numBaths || 'N/A'}
                      </Typography>
                      <Typography variant="body1" style={{ marginBottom: '3px' }}>
                        <strong>Company:</strong> {apartment.company || 'N/A'}
                      </Typography>
                      <Typography variant="body1" style={{ marginBottom: '3px' }}>
                        <strong>Reviews:</strong> {apartment.numReviews || 0}
                      </Typography>
                      <Typography variant="body1" style={{ marginBottom: '3px' }}>
                        <strong>Avg Rating:</strong>{' '}
                        {apartment.avgRating ? apartment.avgRating.toFixed(1) : 'N/A'}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Avg Price:</strong>{' '}
                        {apartment.avgPrice ? `$${apartment.avgPrice.toFixed(0)}` : 'N/A'}
                      </Typography>
                    </div>
                  }
                />
              </ListItem>
            ))}
          </List>
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
            <Tab label="Data" value="Data" />
          </Tabs>
        </Toolbar>
      </AppBar>

      {selectedTab === 'Reviews' && reviews}
      {selectedTab === 'Contact' && contact}
      {selectedTab === 'Data' && data}
      {Modals}
    </div>
  );
};

export default AdminPage;
