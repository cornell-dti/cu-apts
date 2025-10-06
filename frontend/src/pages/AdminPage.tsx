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
  Button,
  TextField,
  Box,
  Fab,
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
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';
import SortIcon from '@material-ui/icons/Sort';
import clsx from 'clsx';
import { colors } from '../colors';
import PhotoCarousel from '../components/PhotoCarousel/PhotoCarousel';
import usePhotoCarousel from '../components/PhotoCarousel/usePhotoCarousel';
import AdminCantFindApt from '../components/Admin/AdminCantFindApt';
import AdminContactQuestion from '../components/Admin/AdminContactQuestion';
import axios from 'axios';
import { createAuthHeaders, getUser } from '../utils/firebase';

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
  headerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(3),
  },
  sortButton: {
    marginLeft: theme.spacing(2),
  },
  editField: {
    marginBottom: theme.spacing(1),
    width: '100%',
  },
  editButtons: {
    display: 'flex',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  apartmentCard: {
    borderBottom: '1px solid #e0e0e0',
    padding: '15px 0',
    position: 'relative',
  },
  editButton: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
  },
}));

/**
 * AdminPage Component
 *
 * This component represents a page that only authorized admins can view. The page has three main tabs:
 *
 * 1. Reviews - Displays review information and allows admins to approve/decline reviews
 * 2. Contact - Shows contact form submissions ("Can't Find Your Apartment" and "Ask Us a Question")
 * 3. Data - Displays a comprehensive list of all apartments with their key details
 *
 * Admins can manage content, respond to user inquiries, and view apartment data all in one place.
 *
 * @returns The rendered AdminPage component with tabbed navigation between Reviews, Contact, and Data sections.
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

  // Sorting and editing state
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editingApartment, setEditingApartment] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{
    numBeds: number | null;
    numBaths: number | null;
    price: number;
  }>({ numBeds: null, numBaths: null, price: 0 });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const apartmentsPerPage = 50;

  // Debug apartments state changes
  useEffect(() => {
    console.log('Apartments loaded:', apartments.length);
  }, [apartments]);
  const {
    container,
    sectionHeader,
    expand,
    expandOpen,
    headerContainer,
    sortButton,
    editField,
    editButtons,
    apartmentCard,
    editButton,
  } = useStyles();
  const {
    carouselPhotos,
    carouselStartIndex,
    carouselOpen,
    showPhotoCarousel,
    closePhotoCarousel,
  } = usePhotoCarousel([]);

  useTitle('Admin');

  // Helper functions for sorting and editing
  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  // First, sort all apartments by ID to get the correct page ranges
  const allApartmentsSorted = [...apartments].sort((a, b) => {
    const aId = a.buildingData?.id || '';
    const bId = b.buildingData?.id || '';
    const aNum = parseInt(aId, 10) || 0;
    const bNum = parseInt(bId, 10) || 0;
    return aNum - bNum; // Always sort ascending to get correct page ranges
  });

  // Filter test apartments (IDs > 1000)
  const testApartments = allApartmentsSorted.filter((apt) => {
    const id = parseInt(apt.buildingData?.id || '0', 10);
    return id > 1000;
  });

  // Determine if we're showing test apartments or regular apartments
  const isTestPage = currentPage > Math.ceil(allApartmentsSorted.length / apartmentsPerPage);
  const apartmentsToShow = isTestPage ? testApartments : allApartmentsSorted;

  // Pagination logic - get the correct apartments for the current page
  const regularPages = Math.ceil(allApartmentsSorted.length / apartmentsPerPage);
  const testPages = Math.ceil(testApartments.length / apartmentsPerPage);
  const totalPages = regularPages + (testPages > 0 ? 1 : 0); // +1 for test apartments page

  const startIndex = isTestPage ? 0 : (currentPage - 1) * apartmentsPerPage;
  const endIndex = isTestPage ? apartmentsPerPage : startIndex + apartmentsPerPage;
  const pageApartments = apartmentsToShow.slice(startIndex, endIndex);

  // Then sort within the page based on the sort order
  const currentPageApartments = [...pageApartments].sort((a, b) => {
    const aId = a.buildingData?.id || '';
    const bId = b.buildingData?.id || '';
    const aNum = parseInt(aId, 10) || 0;
    const bNum = parseInt(bId, 10) || 0;

    if (sortOrder === 'asc') {
      return aNum - bNum;
    } else {
      return bNum - aNum;
    }
  });

  const handleEditClick = (apartment: any) => {
    setEditingApartment(apartment.buildingData?.id);
    setEditFormData({
      numBeds: apartment.buildingData?.numBeds || null,
      numBaths: apartment.buildingData?.numBaths || null,
      price: apartment.avgPrice || 0,
    });
  };

  const handleCancelEdit = () => {
    setEditingApartment(null);
    setEditFormData({ numBeds: null, numBaths: null, price: 0 });
  };

  const handleSaveEdit = async (apartmentId: string) => {
    try {
      const user = await getUser();
      if (!user) {
        alert('You must be logged in to edit apartments');
        return;
      }

      const token = await user.getIdToken(true);
      const updateData: any = {};

      if (editFormData.numBeds !== null) {
        updateData.numBeds = editFormData.numBeds;
      }
      if (editFormData.numBaths !== null) {
        updateData.numBaths = editFormData.numBaths;
      }
      if (editFormData.price !== 0) {
        updateData.price = editFormData.price;
      }

      await axios.put(
        `/api/admin/update-apartment/${apartmentId}`,
        updateData,
        createAuthHeaders(token)
      );

      // Update local state
      setApartments((prev) =>
        prev.map((apt) => {
          if (apt.buildingData?.id === apartmentId) {
            return {
              ...apt,
              buildingData: {
                ...apt.buildingData,
                numBeds: editFormData.numBeds,
                numBaths: editFormData.numBaths,
              },
              avgPrice: editFormData.price,
            };
          }
          return apt;
        })
      );

      setEditingApartment(null);
      setEditFormData({ numBeds: null, numBaths: null, price: 0 });
    } catch (error) {
      console.error('Error updating apartment:', error);
      alert('Failed to update apartment. Please try again.');
    }
  };

  const handleInputChange = (field: 'numBeds' | 'numBaths' | 'price', value: string) => {
    const numValue = field === 'price' ? parseFloat(value) || 0 : parseInt(value) || null;
    setEditFormData((prev) => ({
      ...prev,
      [field]: numValue,
    }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getPageRange = (page: number) => {
    const regularPages = Math.ceil(allApartmentsSorted.length / apartmentsPerPage);

    if (page > regularPages) {
      // This is the test apartments page
      return `Test (${testApartments.length})`;
    } else {
      // Regular page
      const start = (page - 1) * apartmentsPerPage + 1;
      const end = Math.min(page * apartmentsPerPage, allApartmentsSorted.length);
      return `${start}-${end}`;
    }
  };

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
          <div className={headerContainer}>
            <div>
              <Typography variant="h3" style={{ margin: '10px 0' }}>
                <strong>All Apartments ({apartments.length})</strong>
              </Typography>
              <Typography variant="body2" style={{ color: '#666', marginLeft: '10px' }}>
                Sorted within page: {sortOrder === 'asc' ? 'Ascending' : 'Descending'} |
                {isTestPage ? (
                  <>Showing: Test Apartments ({testApartments.length})</>
                ) : (
                  <>
                    Showing: {getPageRange(currentPage)} of {apartments.length}
                  </>
                )}
              </Typography>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Button
                className={sortButton}
                variant="outlined"
                startIcon={<SortIcon />}
                onClick={toggleSortOrder}
                title={`Sort by ID ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {sortOrder === 'asc' ? 'Descending' : 'Ascending'}
              </Button>
            </div>
          </div>

          {/* Pagination Buttons */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '20px',
              justifyContent: 'center',
            }}
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              const regularPages = Math.ceil(allApartmentsSorted.length / apartmentsPerPage);
              const isTestPageButton = page > regularPages;

              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'contained' : 'outlined'}
                  color={
                    currentPage === page ? 'primary' : isTestPageButton ? 'secondary' : 'default'
                  }
                  size="small"
                  onClick={() => handlePageChange(page)}
                  style={{
                    minWidth: '80px',
                    ...(isTestPageButton && { fontWeight: 'bold' }),
                  }}
                >
                  {getPageRange(page)}
                </Button>
              );
            })}
          </div>
          <List>
            {currentPageApartments.map((apartment, index) => {
              const isEditing = editingApartment === apartment.buildingData?.id;

              return (
                <ListItem key={index} className={apartmentCard}>
                  {!isEditing && (
                    <IconButton
                      className={editButton}
                      onClick={() => handleEditClick(apartment)}
                      size="small"
                      title="Edit apartment"
                    >
                      <EditIcon />
                    </IconButton>
                  )}

                  <ListItemText
                    primary={
                      <Typography variant="h6" style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                        {apartment.buildingData?.name || 'N/A'}
                      </Typography>
                    }
                    secondary={
                      <div>
                        <Typography variant="body1" style={{ marginBottom: '3px' }}>
                          <strong>Apartment ID:</strong> {apartment.buildingData?.id || 'N/A'}
                        </Typography>
                        <Typography variant="body1" style={{ marginBottom: '3px' }}>
                          <strong>Address:</strong> {apartment.buildingData?.address || 'N/A'}
                        </Typography>
                        <Typography variant="body1" style={{ marginBottom: '3px' }}>
                          <strong>Location:</strong> {apartment.buildingData?.area || 'N/A'}
                        </Typography>

                        {isEditing ? (
                          <div>
                            <TextField
                              className={editField}
                              label="Bedrooms"
                              type="number"
                              value={editFormData.numBeds || ''}
                              onChange={(e) => handleInputChange('numBeds', e.target.value)}
                              size="small"
                            />
                            <TextField
                              className={editField}
                              label="Bathrooms"
                              type="number"
                              value={editFormData.numBaths || ''}
                              onChange={(e) => handleInputChange('numBaths', e.target.value)}
                              size="small"
                            />
                            <TextField
                              className={editField}
                              label="Average Price"
                              type="number"
                              value={editFormData.price || ''}
                              onChange={(e) => handleInputChange('price', e.target.value)}
                              size="small"
                            />
                            <Box className={editButtons}>
                              <Button
                                variant="contained"
                                color="primary"
                                startIcon={<SaveIcon />}
                                onClick={() => handleSaveEdit(apartment.buildingData?.id)}
                                size="small"
                              >
                                Save
                              </Button>
                              <Button
                                variant="outlined"
                                startIcon={<CancelIcon />}
                                onClick={handleCancelEdit}
                                size="small"
                              >
                                Cancel
                              </Button>
                            </Box>
                          </div>
                        ) : (
                          <div>
                            <Typography variant="body1" style={{ marginBottom: '3px' }}>
                              <strong>Bedrooms:</strong> {apartment.buildingData?.numBeds || 'N/A'}
                            </Typography>
                            <Typography variant="body1" style={{ marginBottom: '3px' }}>
                              <strong>Bathrooms:</strong>{' '}
                              {apartment.buildingData?.numBaths || 'N/A'}
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
                        )}
                      </div>
                    }
                  />
                </ListItem>
              );
            })}
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
