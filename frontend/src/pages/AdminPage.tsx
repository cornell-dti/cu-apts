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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@material-ui/core';
import {
  CantFindApartmentFormWithId,
  QuestionFormWithId,
  ReviewWithId,
} from '../../../common/types/db-types';
import { get } from '../utils/call';
import AdminReviewComponent from '../components/Admin/AdminReview';
import { useTitle } from '../utils';
import { Chart } from 'react-google-charts';
import { sortReviews } from '../utils/sortReviews';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import EditIcon from '@material-ui/icons/Edit';
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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [editingRoomTypes, setEditingRoomTypes] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Apartment field editing state
  const [editingName, setEditingName] = useState('');
  const [editingAddress, setEditingAddress] = useState('');
  const [editingLandlordId, setEditingLandlordId] = useState('');
  const [editingArea, setEditingArea] = useState<
    'COLLEGETOWN' | 'WEST' | 'NORTH' | 'DOWNTOWN' | 'OTHER'
  >('COLLEGETOWN');
  const [editingPhotos, setEditingPhotos] = useState<string[]>([]);
  const [editingLatitude, setEditingLatitude] = useState(0);
  const [editingLongitude, setEditingLongitude] = useState(0);
  const [editingDistance, setEditingDistance] = useState(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const apartmentsPerPage = 50;

  // Search and filter state for Apartment Data tab
  const [searchName, setSearchName] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [roomTypeFilter, setRoomTypeFilter] = useState<'all' | 'with' | 'without'>('all');

  // Migration state
  const [migrationStatus, setMigrationStatus] = useState<
    'idle' | 'preview' | 'running' | 'complete' | 'error'
  >('idle');
  const [migrationSummary, setMigrationSummary] = useState<any>(null);
  const [migrationProgress, setMigrationProgress] = useState<string>('');

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

  // Apply search and filter
  const filteredApartments = apartments.filter((apt) => {
    const aptData = apt.buildingData;
    if (!aptData) return false;

    // Apply name search
    if (searchName && !aptData.name?.toLowerCase().includes(searchName.toLowerCase())) {
      return false;
    }

    // Apply address search
    if (searchAddress && !aptData.address?.toLowerCase().includes(searchAddress.toLowerCase())) {
      return false;
    }

    // Apply room type filter
    if (roomTypeFilter === 'with' && (!aptData.roomTypes || aptData.roomTypes.length === 0)) {
      return false;
    }
    if (roomTypeFilter === 'without' && aptData.roomTypes && aptData.roomTypes.length > 0) {
      return false;
    }

    return true;
  });

  // Sort all apartments by ID to get the correct page ranges
  const allApartmentsSorted = [...filteredApartments].sort((a, b) => {
    const aId = a.buildingData?.id || '';
    const bId = b.buildingData?.id || '';
    const aNum = parseInt(aId, 10) || 0;
    const bNum = parseInt(bId, 10) || 0;
    return aNum - bNum; // Always sort ascending to get correct page ranges
  });

  // Pagination logic
  const totalPages = Math.ceil(allApartmentsSorted.length / apartmentsPerPage);
  const startIndex = (currentPage - 1) * apartmentsPerPage;
  const endIndex = startIndex + apartmentsPerPage;
  const pageApartments = allApartmentsSorted.slice(startIndex, endIndex);

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

  // Migration handler functions
  const handleMigrationPreview = async () => {
    try {
      setMigrationStatus('preview');
      setMigrationProgress('Running dry run...');

      const user = await getUser();
      if (!user) {
        alert('You must be logged in to run migration');
        setMigrationStatus('idle');
        return;
      }

      const token = await user.getIdToken(true);
      const response = await axios.post(
        '/api/admin/migrate-all-apartments-schema',
        { dryRun: true },
        createAuthHeaders(token)
      );

      setMigrationSummary(response.data);
      setMigrationProgress('Preview complete');
      setMigrationStatus('idle');
    } catch (error) {
      console.error('Migration preview error:', error);
      setMigrationProgress(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setMigrationStatus('error');
    }
  };

  const handleMigrationRun = async () => {
    if (
      !window.confirm(
        'Are you sure you want to run the migration? This will modify ALL apartment records in the database.'
      )
    ) {
      return;
    }

    try {
      setMigrationStatus('running');
      setMigrationProgress('Migrating apartments...');

      const user = await getUser();
      if (!user) {
        alert('You must be logged in to run migration');
        setMigrationStatus('idle');
        return;
      }

      const token = await user.getIdToken(true);
      const response = await axios.post(
        '/api/admin/migrate-all-apartments-schema',
        { dryRun: false },
        createAuthHeaders(token)
      );

      setMigrationSummary(response.data);
      setMigrationProgress('Migration complete');
      setMigrationStatus('complete');

      // Reload apartments after migration
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error('Migration error:', error);
      setMigrationProgress(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setMigrationStatus('error');
    }
  };

  // Room Types Edit Handlers
  const handleEditClick = (apartment: any) => {
    const aptData = apartment.buildingData;
    setEditingApartment(aptData?.id || null);
    setEditingRoomTypes(aptData?.roomTypes || []);
    setEditingName(aptData?.name || '');
    setEditingAddress(aptData?.address || '');
    setEditingLandlordId(aptData?.landlordId || '');
    setEditingArea(aptData?.area || 'COLLEGETOWN');
    setEditingPhotos(aptData?.photos || []);
    setEditingLatitude(aptData?.latitude || 0);
    setEditingLongitude(aptData?.longitude || 0);
    setEditingDistance(aptData?.distanceToCampus || 0);
    setEditModalOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingApartment(null);
    setEditingRoomTypes([]);
    setValidationErrors([]);
    setEditingName('');
    setEditingAddress('');
    setEditingLandlordId('');
    setEditingArea('COLLEGETOWN');
    setEditingPhotos([]);
    setEditingLatitude(0);
    setEditingLongitude(0);
    setEditingDistance(0);
    setEditModalOpen(false);
  };

  const handleAddRoomType = () => {
    setEditingRoomTypes((prev) => [
      ...prev,
      { id: '', beds: 1, baths: 1, price: 1 }, // id will be generated by backend
    ]);
  };

  const handleRemoveRoomType = (index: number) => {
    const newRoomTypes = editingRoomTypes.filter((_, i) => i !== index);
    setEditingRoomTypes(newRoomTypes);
    setValidationErrors(validateRoomTypes(newRoomTypes));
  };

  // Validation function
  const validateRoomTypes = (roomTypes: any[]): string[] => {
    const errors: string[] = [];

    // Check for invalid values
    roomTypes.forEach((rt, index) => {
      if (!rt.beds || rt.beds < 1 || !Number.isInteger(rt.beds)) {
        errors.push(`Row ${index + 1}: Beds must be a whole number ≥ 1`);
      }
      if (!rt.baths || rt.baths < 1 || !Number.isInteger(rt.baths)) {
        errors.push(`Row ${index + 1}: Baths must be a whole number ≥ 1`);
      }
      if (!rt.price || rt.price < 1 || !Number.isInteger(rt.price)) {
        errors.push(`Row ${index + 1}: Price must be a whole number ≥ 1`);
      }
    });

    // Check for duplicates
    const seen = new Map<string, number>();
    roomTypes.forEach((rt, index) => {
      const key = `${rt.beds}-${rt.baths}-${rt.price}`;
      if (seen.has(key)) {
        errors.push(
          `Duplicate room type: ${rt.beds} bed${rt.beds > 1 ? 's' : ''}, ${rt.baths} bath${
            rt.baths > 1 ? 's' : ''
          }, $${rt.price} (rows ${seen.get(key)! + 1} and ${index + 1})`
        );
      } else {
        seen.set(key, index);
      }
    });

    return errors;
  };

  const handleRoomTypeChange = (
    index: number,
    field: 'beds' | 'baths' | 'price',
    value: string
  ) => {
    const numValue = parseInt(value) || 1;
    if (numValue < 1) return; // Enforce >= 1 constraint

    const newRoomTypes = editingRoomTypes.map((rt, i) =>
      i === index ? { ...rt, [field]: numValue } : rt
    );
    setEditingRoomTypes(newRoomTypes);
    setValidationErrors(validateRoomTypes(newRoomTypes));
  };

  const handleSaveEdit = async () => {
    if (!editingApartment) return;

    // Validate before saving
    const errors = validateRoomTypes(editingRoomTypes);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Validate required fields
    if (!editingName.trim()) {
      alert('Apartment name is required');
      return;
    }
    if (!editingAddress.trim()) {
      alert('Address is required');
      return;
    }

    try {
      const user = await getUser();
      if (!user) {
        alert('You must be logged in to edit apartments');
        return;
      }

      const token = await user.getIdToken(true);
      const response = await axios.put(
        `/api/admin/update-apartment/${editingApartment}`,
        {
          name: editingName.trim(),
          address: editingAddress.trim(),
          landlordId: editingLandlordId.trim() || null,
          area: editingArea,
          photos: editingPhotos,
          latitude: editingLatitude,
          longitude: editingLongitude,
          distanceToCampus: editingDistance,
          roomTypes: editingRoomTypes,
        },
        createAuthHeaders(token)
      );

      // Update local state with the response (which includes generated UUIDs)
      setApartments((prev) =>
        prev.map((apt) => {
          if (apt.buildingData?.id === editingApartment) {
            return {
              ...apt,
              buildingData: response.data.apartment,
            };
          }
          return apt;
        })
      );

      alert('Room types updated successfully!');
      handleCancelEdit();
    } catch (error: any) {
      console.error('Error updating apartment:', error);
      const errorMsg = error.response?.data || 'Failed to update apartment. Please try again.';
      alert(errorMsg);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getPageRange = (page: number) => {
    const start = (page - 1) * apartmentsPerPage + 1;
    const end = Math.min(page * apartmentsPerPage, allApartmentsSorted.length);
    return `${start}-${end}`;
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

  // Developer Tools tab
  const developerTools = (
    <Container className={container}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h3" style={{ margin: '10px 0', marginBottom: '20px' }}>
            <strong>Developer Tools</strong>
          </Typography>

          {/* Migration Section */}
          <Box
            style={{
              marginBottom: '40px',
              padding: '20px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
            }}
          >
            <Typography variant="h5" style={{ marginBottom: '15px', fontWeight: 'bold' }}>
              Schema Migration
            </Typography>
            <Typography variant="body1" style={{ marginBottom: '15px', color: '#666' }}>
              Migrate all apartments from old schema (numBeds, numBaths, price) to new room types
              schema. All apartments will be initialized with empty roomTypes array.
            </Typography>

            <Box style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleMigrationPreview}
                disabled={migrationStatus === 'running' || migrationStatus === 'preview'}
              >
                Preview Migration (Dry Run)
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleMigrationRun}
                disabled={migrationStatus === 'running' || migrationStatus === 'preview'}
              >
                Run Migration
              </Button>
            </Box>

            {/* Migration Progress */}
            {migrationProgress && (
              <Box
                style={{
                  marginTop: '15px',
                  padding: '10px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                }}
              >
                <Typography variant="body2" style={{ fontFamily: 'monospace' }}>
                  <strong>Status:</strong> {migrationProgress}
                </Typography>
              </Box>
            )}

            {/* Migration Summary */}
            {migrationSummary && (
              <Box
                style={{
                  marginTop: '15px',
                  padding: '15px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                }}
              >
                <Typography variant="body2" style={{ marginBottom: '10px', fontWeight: 'bold' }}>
                  {migrationSummary.dryRun ? 'Dry Run Results:' : 'Migration Results:'}
                </Typography>
                <Typography variant="body2" style={{ fontFamily: 'monospace' }}>
                  Total Apartments: {migrationSummary.totalApartments}
                </Typography>
                {!migrationSummary.dryRun && (
                  <>
                    <Typography variant="body2" style={{ fontFamily: 'monospace', color: 'green' }}>
                      Migrated: {migrationSummary.migrated}
                    </Typography>
                    <Typography variant="body2" style={{ fontFamily: 'monospace', color: 'red' }}>
                      Failed: {migrationSummary.failed}
                    </Typography>
                    <Typography variant="body2" style={{ fontFamily: 'monospace' }}>
                      Duration: {migrationSummary.durationMs}ms
                    </Typography>
                  </>
                )}
                {migrationSummary.errors && migrationSummary.errors.length > 0 && (
                  <Box style={{ marginTop: '10px' }}>
                    <Typography variant="body2" style={{ fontWeight: 'bold', color: 'red' }}>
                      Errors:
                    </Typography>
                    {migrationSummary.errors.slice(0, 10).map((error: string, idx: number) => (
                      <Typography
                        key={idx}
                        variant="body2"
                        style={{ fontFamily: 'monospace', fontSize: '11px' }}
                      >
                        {error}
                      </Typography>
                    ))}
                  </Box>
                )}
                {migrationSummary.sampleApartments && (
                  <Box style={{ marginTop: '10px' }}>
                    <Typography variant="body2" style={{ fontWeight: 'bold' }}>
                      Sample Apartments (first 3):
                    </Typography>
                    {migrationSummary.sampleApartments.map((apt: any, idx: number) => (
                      <Typography
                        key={idx}
                        variant="body2"
                        style={{ fontFamily: 'monospace', fontSize: '11px' }}
                      >
                        {apt.id}: {apt.name} (hasOldSchema: {apt.hasOldSchema ? 'yes' : 'no'})
                      </Typography>
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </Box>
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
                Sorted within page: {sortOrder === 'asc' ? 'Ascending' : 'Descending'} | Showing:{' '}
                {getPageRange(currentPage)} of {filteredApartments.length} filtered (
                {apartments.length} total)
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

          {/* Search and Filter Controls */}
          <Box
            style={{
              marginBottom: '20px',
              padding: '15px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              backgroundColor: '#f9f9f9',
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search by Name"
                  variant="outlined"
                  value={searchName}
                  onChange={(e) => {
                    setSearchName(e.target.value);
                    setCurrentPage(1); // Reset to first page on search
                  }}
                  placeholder="Enter apartment name..."
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search by Address"
                  variant="outlined"
                  value={searchAddress}
                  onChange={(e) => {
                    setSearchAddress(e.target.value);
                    setCurrentPage(1); // Reset to first page on search
                  }}
                  placeholder="Enter address..."
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  select
                  label="Room Types Filter"
                  variant="outlined"
                  value={roomTypeFilter}
                  onChange={(e) => {
                    setRoomTypeFilter(e.target.value as 'all' | 'with' | 'without');
                    setCurrentPage(1); // Reset to first page on filter change
                  }}
                  SelectProps={{ native: true }}
                >
                  <option value="all">All Apartments</option>
                  <option value="with">With Room Types</option>
                  <option value="without">Without Room Types</option>
                </TextField>
              </Grid>
            </Grid>
          </Box>

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
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'contained' : 'outlined'}
                color={currentPage === page ? 'primary' : 'default'}
                size="small"
                onClick={() => handlePageChange(page)}
                style={{ minWidth: '80px' }}
              >
                {getPageRange(page)}
              </Button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentPageApartments.map((apartment, index) => {
              const aptData = apartment.buildingData;
              const hasRoomTypes = aptData?.roomTypes && aptData.roomTypes.length > 0;

              return (
                <Box
                  key={index}
                  style={{
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '16px',
                    backgroundColor: '#fff',
                    position: 'relative',
                  }}
                >
                  {/* Edit Button */}
                  <IconButton
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: '#f5f5f5',
                    }}
                    onClick={() => handleEditClick(apartment)}
                    size="small"
                    title="Edit apartment"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>

                  {/* Apartment Name and ID */}
                  <Typography
                    variant="h6"
                    style={{ fontWeight: 'bold', marginBottom: '12px', paddingRight: '50px' }}
                  >
                    {aptData?.name || 'N/A'}
                    <Typography
                      component="span"
                      variant="body2"
                      style={{ color: '#666', marginLeft: '12px', fontWeight: 'normal' }}
                    >
                      ID: {aptData?.id || 'N/A'}
                    </Typography>
                  </Typography>

                  {/* Main Info Grid */}
                  <Grid container spacing={2}>
                    {/* Left Column - Location Info */}
                    <Grid item xs={12} sm={6} md={4}>
                      <Box>
                        <Typography variant="body2" style={{ color: '#666', fontSize: '12px' }}>
                          ADDRESS
                        </Typography>
                        <Typography variant="body1" style={{ marginBottom: '8px' }}>
                          {aptData?.address || 'N/A'}
                        </Typography>
                        <Typography variant="body2" style={{ color: '#666', fontSize: '12px' }}>
                          AREA
                        </Typography>
                        <Typography variant="body1">{aptData?.area || 'N/A'}</Typography>
                      </Box>
                    </Grid>

                    {/* Middle Column - Room Types & Company */}
                    <Grid item xs={12} sm={6} md={4}>
                      <Box>
                        <Typography variant="body2" style={{ color: '#666', fontSize: '12px' }}>
                          ROOM TYPES
                        </Typography>
                        <Typography
                          variant="body1"
                          style={{
                            marginBottom: '8px',
                            color: hasRoomTypes ? '#000' : '#999',
                            fontStyle: hasRoomTypes ? 'normal' : 'italic',
                          }}
                        >
                          {hasRoomTypes
                            ? `${aptData.roomTypes.length} type${
                                aptData.roomTypes.length > 1 ? 's' : ''
                              }`
                            : 'No room types'}
                        </Typography>
                        <Typography variant="body2" style={{ color: '#666', fontSize: '12px' }}>
                          COMPANY
                        </Typography>
                        <Typography variant="body1">{apartment.company || 'N/A'}</Typography>
                      </Box>
                    </Grid>

                    {/* Right Column - Stats */}
                    <Grid item xs={12} sm={6} md={4}>
                      <Box>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2" style={{ color: '#666', fontSize: '12px' }}>
                              REVIEWS
                            </Typography>
                            <Typography variant="body1">{apartment.numReviews || 0}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" style={{ color: '#666', fontSize: '12px' }}>
                              AVG RATING
                            </Typography>
                            <Typography variant="body1">
                              {apartment.avgRating ? apartment.avgRating.toFixed(1) : 'N/A'}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" style={{ color: '#666', fontSize: '12px' }}>
                              AVG PRICE
                            </Typography>
                            <Typography variant="body1">
                              {apartment.avgPrice ? `$${apartment.avgPrice.toFixed(0)}` : 'N/A'}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              );
            })}
          </div>
        </Grid>
      </Grid>
    </Container>
  );

  // Room Types Edit Modal
  const roomTypesModal = (
    <Dialog open={editModalOpen} onClose={handleCancelEdit} maxWidth="lg" fullWidth>
      <DialogTitle>
        Edit Apartment
        {editingApartment && (
          <Typography variant="body2" style={{ color: '#666', marginTop: '5px' }}>
            Apartment ID: {editingApartment}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        {/* Apartment Information Section */}
        <Box style={{ marginBottom: '30px' }}>
          <Typography variant="h6" style={{ marginBottom: '15px', fontWeight: 'bold' }}>
            Apartment Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                required
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Address"
                value={editingAddress}
                onChange={(e) => setEditingAddress(e.target.value)}
                required
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Landlord ID"
                value={editingLandlordId}
                onChange={(e) => setEditingLandlordId(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Area"
                value={editingArea}
                onChange={(e) => setEditingArea(e.target.value as any)}
                SelectProps={{ native: true }}
                size="small"
              >
                <option value="COLLEGETOWN">Collegetown</option>
                <option value="WEST">West</option>
                <option value="NORTH">North</option>
                <option value="DOWNTOWN">Downtown</option>
                <option value="OTHER">Other</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Latitude"
                value={editingLatitude}
                onChange={(e) => setEditingLatitude(parseFloat(e.target.value) || 0)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Longitude"
                value={editingLongitude}
                onChange={(e) => setEditingLongitude(parseFloat(e.target.value) || 0)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Distance to Campus (mi)"
                value={editingDistance}
                onChange={(e) => setEditingDistance(parseFloat(e.target.value) || 0)}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Photo URLs (comma-separated)"
                value={editingPhotos.join(', ')}
                onChange={(e) =>
                  setEditingPhotos(
                    e.target.value
                      .split(',')
                      .map((url) => url.trim())
                      .filter(Boolean)
                  )
                }
                size="small"
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Room Types Section */}
        <Typography variant="h6" style={{ marginBottom: '15px', fontWeight: 'bold' }}>
          Room Types
        </Typography>
        {editingRoomTypes.length === 0 ? (
          <Typography variant="body1" style={{ color: '#999', padding: '20px 0' }}>
            No room types. Click "Add Room Type" below to add one.
          </Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Beds</strong>
                </TableCell>
                <TableCell>
                  <strong>Baths</strong>
                </TableCell>
                <TableCell>
                  <strong>Price</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Actions</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {editingRoomTypes.map((roomType, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <TextField
                      type="number"
                      value={roomType.beds}
                      onChange={(e) => handleRoomTypeChange(index, 'beds', e.target.value)}
                      inputProps={{ min: 1, step: 1 }}
                      size="small"
                      style={{ width: '80px' }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={roomType.baths}
                      onChange={(e) => handleRoomTypeChange(index, 'baths', e.target.value)}
                      inputProps={{ min: 1, step: 1 }}
                      size="small"
                      style={{ width: '80px' }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={roomType.price}
                      onChange={(e) => handleRoomTypeChange(index, 'price', e.target.value)}
                      inputProps={{ min: 1, step: 1 }}
                      size="small"
                      style={{ width: '100px' }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() => handleRemoveRoomType(index)}
                      size="small"
                      color="secondary"
                      title="Remove this room type"
                    >
                      <CancelIcon />
                    </IconButton>
                    {roomType.id && (
                      <Typography
                        variant="caption"
                        style={{
                          color: '#999',
                          fontSize: '10px',
                          display: 'block',
                          marginTop: '2px',
                        }}
                      >
                        ID: {roomType.id.slice(0, 8)}...
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Box style={{ marginTop: '20px' }}>
          <Button variant="outlined" color="primary" onClick={handleAddRoomType} size="small">
            + Add Room Type
          </Button>
        </Box>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Box
            style={{
              marginTop: '20px',
              padding: '12px',
              backgroundColor: '#ffebee',
              borderRadius: '4px',
              border: '1px solid #ef5350',
            }}
          >
            <Typography
              variant="body2"
              style={{ fontWeight: 'bold', color: '#c62828', marginBottom: '8px' }}
            >
              Please fix the following errors:
            </Typography>
            {validationErrors.map((error, idx) => (
              <Typography
                key={idx}
                variant="body2"
                style={{ color: '#c62828', fontSize: '13px', marginLeft: '8px' }}
              >
                • {error}
              </Typography>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancelEdit} color="default">
          Cancel
        </Button>
        <Button
          onClick={handleSaveEdit}
          color="primary"
          variant="contained"
          disabled={validationErrors.length > 0}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <div>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Tabs
            value={selectedTab}
            onChange={(_event, newValue) => setSelectedTab(newValue)}
            aria-label="navigation tabs"
            variant="fullWidth"
          >
            <Tab label="Reviews" value="Reviews" />
            <Tab label="Contact" value="Contact" />
            <Tab label="Apartment Data" value="Data" />
            <Tab label="Dev Tools" value="DevTools" />
          </Tabs>
        </Toolbar>
      </AppBar>

      {selectedTab === 'Reviews' && reviews}
      {selectedTab === 'Contact' && contact}
      {selectedTab === 'Data' && data}
      {selectedTab === 'DevTools' && developerTools}
      {Modals}
      {roomTypesModal}
    </div>
  );
};

export default AdminPage;
