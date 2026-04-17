import React, { ReactElement, useEffect, useRef, useState } from 'react';
import {
  Typography,
  makeStyles,
  Grid,
  Container,
  Box,
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  IconButton,
  Button,
  TextField,
  MenuItem,
  Chip,
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
import Autocomplete from '@material-ui/lab/Autocomplete';
import {
  CantFindApartmentFormWithId,
  QuestionFormWithId,
  ReviewWithId,
} from '../../../common/types/db-types';
import axios from 'axios';
import { getUser, createAuthHeaders } from '../utils/firebase';
import firebase from 'firebase/app';
import 'firebase/storage';
import { get } from '../utils/call';
import AdminReviewComponent from '../components/Admin/AdminReview';
import { useTitle } from '../utils';
import { Chart } from 'react-google-charts';
import { sortReviews } from '../utils/sortReviews';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Editor } from '@tinymce/tinymce-react';
import EditIcon from '@material-ui/icons/Edit';
import CancelIcon from '@material-ui/icons/Cancel';
import SortIcon from '@material-ui/icons/Sort';
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
  const [reportedData, setReportedData] = useState<ReviewWithId[]>([]);

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

  // Create new apartment state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newApartmentName, setNewApartmentName] = useState('');
  const [newApartmentAddress, setNewApartmentAddress] = useState('');
  const [newApartmentLandlordId, setNewApartmentLandlordId] = useState('');
  const [newApartmentArea, setNewApartmentArea] = useState<
    'COLLEGETOWN' | 'WEST' | 'NORTH' | 'DOWNTOWN' | 'OTHER'
  >('COLLEGETOWN');
  const [createStatus, setCreateStatus] = useState<'idle' | 'preview' | 'creating' | 'error'>(
    'idle'
  );
  const [previewData, setPreviewData] = useState<any>(null);
  const [createError, setCreateError] = useState('');

  // Init collections state
  const [initStatus, setInitStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [initResults, setInitResults] = useState<string[]>([]);

  // Admin whitelist state
  type FirestoreTimestamp = { _seconds: number; _nanoseconds: number };
  type WhitelistEntry = {
    id: string;
    email: string;
    addedAt?: string | FirestoreTimestamp;
    addedBy?: string;
  };
  const [superadmins, setSuperadmins] = useState<string[]>([]);
  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([]);
  const [whitelistLoading, setWhitelistLoading] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [whitelistError, setWhitelistError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [confirmRemoveEmail, setConfirmRemoveEmail] = useState<string | null>(null);

  const [scraperStatus, setScraperStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [scraperSummary, setScraperSummary] = useState<any>(null);
  const [scraperError, setScraperError] = useState<string>('');

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

  // -----------------------------
  // Blog post creation (improved)
  // -----------------------------
  const [blogTitle, setBlogTitle] = useState('');
  const [blogBlurb, setBlogBlurb] = useState('');
  const [blogVisibility, setBlogVisibility] = useState<'ACTIVATED' | 'ARCHIVED'>('ACTIVATED');
  const [blogContent, setBlogContent] = useState<string>(''); // TinyMCE HTML
  const [blogTags, setBlogTags] = useState<string[]>([]);

  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [blogSaving, setBlogSaving] = useState(false);
  const [blogError, setBlogError] = useState<string | null>(null);
  const [blogSuccess, setBlogSuccess] = useState<string | null>(null);

  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

  const pickCoverImage = () => coverInputRef.current?.click();

  const onCoverFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // optional: local preview while uploading
    setCoverPreviewUrl(URL.createObjectURL(file));

    try {
      setBlogError(null);
      setCoverUploading(true);

      const safeName = file.name.replace(/\s+/g, '_');
      const path = `blog-covers/${Date.now()}-${safeName}`;

      const storageRef = firebase.storage().ref().child(path);
      await storageRef.put(file);
      const url = await storageRef.getDownloadURL();

      setCoverImageUrl(url);
      setBlogSuccess('Cover image uploaded!');
    } catch (err) {
      console.error(err);
      setBlogError('Failed to upload cover image.');
    } finally {
      setCoverUploading(false);
      e.target.value = '';
    }
  };

  const svgPlaceholder = (w: number, h: number, label: string) => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
        <defs>
          <pattern id="checker" width="32" height="32" patternUnits="userSpaceOnUse">
            <rect width="32" height="32" fill="#f3f4f6"/>
            <rect width="16" height="16" fill="#e5e7eb"/>
            <rect x="16" y="16" width="16" height="16" fill="#e5e7eb"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#checker)"/>
        <rect x="10" y="10" width="${Math.max(w - 20, 20)}" height="${Math.max(h - 20, 20)}"
              rx="14" fill="none" stroke="#bdbdbd" stroke-width="3" stroke-dasharray="10 8"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
              font-family="Inter, Arial, sans-serif" font-size="18" fill="#6b7280">
          ${label}
        </text>
      </svg>
    `.trim();

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  const handleCreateBlogPost = async () => {
    setBlogError(null);
    setBlogSuccess(null);

    if (!blogTitle.trim() || !blogBlurb.trim() || !blogContent.trim() || !coverImageUrl.trim()) {
      setBlogError('Title, blurb, cover image, and content are required.');
      return;
    }

    try {
      setBlogSaving(true);
      const user = await getUser(true);
      if (!user) throw new Error('You must be logged in as an admin to create a blog post.');

      const token = await user.getIdToken(true);

      const payload = {
        title: blogTitle.trim(),
        blurb: blogBlurb.trim(),
        content: blogContent,
        tags: blogTags.map((t) => t.trim()).filter(Boolean),
        coverImageUrl: coverImageUrl.trim(),
        visibility: blogVisibility, // "ACTIVATED" | "ARCHIVED"
        userId: user.uid,
        likes: 0,
        saves: 0,
      };

      await axios.post('/api/new-blog-post', payload, createAuthHeaders(token));

      setBlogSuccess('Blog post created!');
      setBlogTitle('');
      setBlogBlurb('');
      setBlogContent('');
      setBlogVisibility('ACTIVATED');
      setBlogTags([]);
      setCoverImageUrl('');
    } catch (err) {
      console.error(err);
      setBlogError('Failed to create blog post. Please try again.');
    } finally {
      setBlogSaving(false);
    }
  };

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

  // Create new apartment handlers
  const handleOpenCreateModal = () => {
    setCreateModalOpen(true);
    setCreateStatus('idle');
    setPreviewData(null);
    setCreateError('');
    setNewApartmentName('');
    setNewApartmentAddress('');
    setNewApartmentLandlordId('');
    setNewApartmentArea('COLLEGETOWN');
  };

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
    setCreateStatus('idle');
    setPreviewData(null);
    setCreateError('');
  };

  const handlePreviewApartment = async () => {
    if (!newApartmentName.trim() || !newApartmentAddress.trim() || !newApartmentLandlordId.trim()) {
      setCreateError('Please fill in all required fields');
      return;
    }

    try {
      setCreateStatus('preview');
      setCreateError('');

      const user = await getUser();
      if (!user) {
        setCreateError('You must be logged in');
        setCreateStatus('error');
        return;
      }

      const token = await user.getIdToken(true);
      const response = await axios.post(
        '/api/admin/add-apartment',
        {
          name: newApartmentName.trim(),
          address: newApartmentAddress.trim(),
          landlordId: newApartmentLandlordId.trim(),
          area: newApartmentArea,
          confirm: false, // Preview mode
        },
        createAuthHeaders(token)
      );

      setPreviewData(response.data);
      setCreateStatus('idle');
    } catch (error: any) {
      console.error('Preview error:', error);
      setCreateError(error.response?.data || error.message || 'Error previewing apartment');
      setCreateStatus('error');
    }
  };

  const handleConfirmCreate = async () => {
    try {
      setCreateStatus('creating');
      setCreateError('');

      const user = await getUser();
      if (!user) {
        setCreateError('You must be logged in');
        setCreateStatus('error');
        return;
      }

      const token = await user.getIdToken(true);
      const response = await axios.post(
        '/api/admin/add-apartment',
        {
          name: newApartmentName.trim(),
          address: newApartmentAddress.trim(),
          landlordId: newApartmentLandlordId.trim(),
          area: newApartmentArea,
          confirm: true, // Create mode
        },
        createAuthHeaders(token)
      );

      alert(`Apartment created successfully! ID: ${response.data.apartmentId}`);
      setCreateModalOpen(false);
      setCreateStatus('idle');
      setPreviewData(null);

      // Reload apartments list
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('Create error:', error);
      setCreateError(error.response?.data || error.message || 'Error creating apartment');
      setCreateStatus('error');
    }
  };

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

  const fetchWhitelist = async () => {
    setWhitelistLoading(true);
    setWhitelistError(null);
    try {
      const user = await getUser(true);
      if (!user) throw new Error('Not authenticated');
      const token = await user.getIdToken(true);
      const response = await axios.get('/api/admin/whitelist', createAuthHeaders(token));
      setSuperadmins(response.data.superadmins ?? []);
      setWhitelist(response.data.whitelist ?? []);
    } catch (err) {
      setWhitelistError('Failed to load whitelist.');
    } finally {
      setWhitelistLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) return;
    setAddingAdmin(true);
    setWhitelistError(null);
    try {
      const user = await getUser(true);
      if (!user) throw new Error('Not authenticated');
      const token = await user.getIdToken(true);
      await axios.post(
        '/api/admin/whitelist',
        { email: newAdminEmail.trim().toLowerCase() },
        createAuthHeaders(token)
      );
      setNewAdminEmail('');
      await fetchWhitelist();
    } catch (err: any) {
      setWhitelistError(err?.response?.data || 'Failed to add admin.');
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleRemoveAdmin = async (email: string, id: string) => {
    setRemovingId(id);
    setWhitelistError(null);
    try {
      const user = await getUser(true);
      if (!user) throw new Error('Not authenticated');
      const token = await user.getIdToken(true);
      await axios.delete(
        `/api/admin/whitelist/${encodeURIComponent(email)}`,
        createAuthHeaders(token)
      );
      setConfirmRemoveEmail(null);
      await fetchWhitelist();
    } catch (err: any) {
      setWhitelistError(err?.response?.data || 'Failed to remove admin.');
    } finally {
      setRemovingId(null);
    }
  };

  const handleInitCollections = async () => {
    setInitStatus('running');
    setInitResults([]);
    try {
      const user = await getUser(true);
      if (!user) throw new Error('Not authenticated');
      const token = await user.getIdToken(true);
      const response = await axios.post(
        '/api/admin/init-collections',
        {},
        createAuthHeaders(token)
      );
      setInitResults(response.data.results ?? []);
      setInitStatus('done');
    } catch (err) {
      console.error('Init collections error:', err);
      setInitResults([`Error: ${err instanceof Error ? err.message : 'Unknown error'}`]);
      setInitStatus('error');
    }
  };

  const handleRunScraper = async () => {
    try {
      setScraperStatus('running');
      setScraperSummary(null);
      setScraperError('');

      const user = await getUser();
      if (!user) {
        alert('You must be logged in to run the scraper');
        setScraperStatus('idle');
        return;
      }

      const token = await user.getIdToken(true);
      const response = await axios.post('/api/admin/run-scraper', {}, createAuthHeaders(token));

      setScraperSummary(response.data);
      setScraperStatus('done');
    } catch (error: any) {
      console.error('Scraper error:', error);
      setScraperError(error.response?.data || error.message || 'Unknown error');
      setScraperStatus('error');
    }
  };

  const handleDownloadScraperCSV = async () => {
    const user = await getUser();
    if (!user) return;
    const token = await user.getIdToken(true);

    // Fetch with auth header and trigger browser download
    const response = await fetch('/api/admin/scraper-results.csv', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      alert('No scraper results found. Run the scraper first.');
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scraper_diff.csv';
    a.click();
    URL.revokeObjectURL(url);
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
      get<ReviewWithId[]>(`/api/review/${reviewType}`, { callback: cllbck });
    });
  }, [toggle]);

  useEffect(() => {
    const reviewCounts = new Map<string, React.Dispatch<React.SetStateAction<ReviewCount>>>([
      ['COLLEGETOWN', setCtownReviewCount],
      ['DOWNTOWN', setDtownReviewCount],
      ['WEST', setWestReviewCount],
      ['NORTH', setNorthReviewCount],
    ]);
    reviewCounts.forEach((cllbck, location) => {
      get<ReviewCount>(`/api/review/${location}/count`, { callback: cllbck });
    });
  }, [toggle]);

  const pieChartData = [
    ['Location', 'Review Count'],
    ['Collegetown', ctownReviewCount.count],
    ['West', westReviewCount.count],
    ['Downtown', dtownReviewCount.count],
    ['North', northReviewCount.count],
  ];

  const TAG_OPTIONS = ['Tips & Tricks', 'Finances', 'Landlords', 'Op-Eds'];

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
              options={{ title: 'Reviews Breakdown' }}
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
              className={clsx(expand, { [expandOpen]: reportedExpanded })}
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
              className={clsx(expand, { [expandOpen]: pendingExpanded })}
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
              className={clsx(expand, { [expandOpen]: declinedExpanded })}
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

  const blogPosts = (
    <Container className={container}>
      <Box mt={4} mb={4}>
        <Typography variant="h3" style={{ marginBottom: '24px' }}>
          <strong>Create Blog Post</strong>
        </Typography>

        <Box display="flex" flexDirection="column" gridGap={24}>
          <TextField
            label="Title"
            variant="outlined"
            fullWidth
            helperText="Title of the Blog Post"
            value={blogTitle}
            onChange={(e) => setBlogTitle(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Blurb"
            variant="outlined"
            fullWidth
            multiline
            minRows={3}
            helperText="Short summary shown on the blog cards page"
            value={blogBlurb}
            onChange={(e) => setBlogBlurb(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            select
            label="Visibility"
            variant="outlined"
            fullWidth
            value={blogVisibility}
            onChange={(e) => setBlogVisibility(e.target.value as 'ACTIVATED' | 'ARCHIVED')}
            helperText="ACTIVATED = visible, ARCHIVED = hidden"
            InputLabelProps={{ shrink: true }}
          >
            <MenuItem value="ACTIVATED">ACTIVATED</MenuItem>
            <MenuItem value="ARCHIVED">ARCHIVED</MenuItem>
          </TextField>

          {/* Tags */}
          <Box>
            <Autocomplete
              multiple
              options={TAG_OPTIONS}
              value={blogTags}
              onChange={(_, newValue) => setBlogTags(newValue)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip variant="default" label={option} {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tags"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Box>

          <Box width="100%">
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={onCoverFileSelected}
            />

            <TextField
              label="Cover Image URL"
              variant="outlined"
              fullWidth
              required
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            <Box mt={1} display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                onClick={pickCoverImage}
                disabled={coverUploading}
                style={{
                  backgroundColor: colors.red1,
                  color: 'white',
                  height: 40,
                  borderRadius: 8,
                  padding: '0 18px',
                }}
              >
                {coverUploading ? 'Uploading…' : 'Upload'}
              </Button>
            </Box>

            {(coverPreviewUrl || coverImageUrl) && (
              <Box mt={2}>
                <img
                  src={coverImageUrl || coverPreviewUrl || ''}
                  alt="Cover preview"
                  style={{
                    maxWidth: 420,
                    width: '100%',
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                  }}
                />
              </Box>
            )}
          </Box>

          {/* Content */}
          <Box mt={2}>
            <Typography variant="h6" style={{ marginBottom: '8px' }}>
              Content
            </Typography>

            <Editor
              apiKey="nlqgp4abfsx0n7eulsckg9qd2g31788bz0y3gxatyvj8m41p"
              value={blogContent}
              onEditorChange={(newContent: string) => setBlogContent(newContent)}
              init={{
                height: 600,
                plugins: [
                  'anchor',
                  'autolink',
                  'charmap',
                  'codesample',
                  'emoticons',
                  'link',
                  'lists',
                  'searchreplace',
                  'table',
                  'visualblocks',
                  'wordcount',
                  'template',
                ],
                toolbar:
                  'undo redo | blocks | bold italic underline | link table | ' +
                  'align | bullist numlist | removeformat | template',
                templates: [
                  // ---------------------------
                  // Template 1: Collage + text
                  // ---------------------------
                  {
                    title: 'Template 1 — Collage + Article',
                    description: 'Top collage (3-up + wide) then header + subheaders',
                    content: `
                      <div style="max-width: 920px; margin: 0 auto;">

                        <!-- Collage: tall left + two stacked right -->
                        <div style="
                          display: grid;
                          grid-template-columns: 1.4fr 1fr;
                          gap: 20px;
                          align-items: stretch;
                          margin-bottom: 20px;
                        ">
                          <figure
                            class="image-slot"
                            data-image-slot="true"
                            style="
                              position: relative;
                              height: 420px;
                              border-radius: 18px;
                              overflow: hidden;
                              margin: 0;
                            "
                          >
                            <img
                              src="${svgPlaceholder(520, 420, 'Click to add image')}"
                              alt="Placeholder"
                              style="width: 100%; height: 100%; object-fit: cover; display: block;"
                            />
                          </figure>

                          <div style="display: grid; grid-template-rows: 1fr 1fr; gap: 20px;">
                            <figure
                              class="image-slot"
                              data-image-slot="true"
                              style="
                                position: relative;
                                height: 200px;
                                border-radius: 18px;
                                overflow: hidden;
                                margin: 0;
                              "
                            >
                              <img
                                src="${svgPlaceholder(360, 200, 'Click to add image')}"
                                alt="Placeholder"
                                style="width: 100%; height: 100%; object-fit: cover; display: block;"
                              />
                            </figure>

                            <figure
                              class="image-slot"
                              data-image-slot="true"
                              style="
                                position: relative;
                                height: 200px;
                                border-radius: 18px;
                                overflow: hidden;
                                margin: 0;
                              "
                            >
                              <img
                                src="${svgPlaceholder(360, 200, 'Click to add image')}"
                                alt="Placeholder"
                                style="width: 100%; height: 100%; object-fit: cover; display: block;"
                              />
                            </figure>
                          </div>
                        </div>

                        <!-- Wide bottom image -->
                        <figure
                          class="image-slot"
                          data-image-slot="true"
                          style="
                            position: relative;
                            height: 200px;
                            border-radius: 18px;
                            overflow: hidden;
                            margin: 0 0 32px 0;
                          "
                        >
                          <img
                            src="${svgPlaceholder(880, 200, 'Click to add image')}"
                            alt="Placeholder"
                            style="width: 100%; height: 100%; object-fit: cover; display: block;"
                          />
                        </figure>

                        <!-- Text block -->
                        <div>
                          <h2 style="margin: 0 0 10px;">Header</h2>
                          <p style="margin: 0 0 22px; line-height: 1.6;">
                            Write your intro paragraph here…
                          </p>

                          <h3 style="margin: 0 0 8px;">Subheader</h3>
                          <p style="margin: 0 0 18px; line-height: 1.6;">
                            Write supporting content here…
                          </p>

                          <h3 style="margin: 0 0 8px;">Subheader</h3>
                          <p style="margin: 0; line-height: 1.6;">
                            Write supporting content here…
                          </p>
                        </div>
                      </div>
                    `,
                  },

                  // -------------------------------------
                  // Template 2: Alternating image blocks
                  // -------------------------------------
                  {
                    title: 'Template 2 — Alternating Image / Text',
                    description: 'Zig-zag layout: text left, image right (alternating)',
                    content: `
                      <div style="max-width: 920px; margin: 0 auto;">

                        <!-- Row 1: text left, image right -->
                        <div style="
                          display: grid;
                          grid-template-columns: 1.3fr 1fr;
                          gap: 24px;
                          align-items: center;
                          margin: 18px 0 34px;
                        ">
                          <div>
                            <h3 style="margin: 0 0 10px;">Header</h3>
                            <p style="margin: 0; line-height: 1.6;">
                              Write your section text here…
                            </p>
                          </div>
                          <figure
                            class="image-slot"
                            data-image-slot="true"
                            style="
                              position: relative;
                              height: 260px;
                              border-radius: 18px;
                              overflow: hidden;
                              margin: 0;
                            "
                          >
                            <img
                              src="${svgPlaceholder(380, 260, 'Click to add image')}"
                              alt="Placeholder"
                              style="width: 100%; height: 100%; object-fit: cover; display: block;"
                            />
                          </figure>
                        </div>

                        <!-- Row 2: image left, text right -->
                        <div style="
                          display: grid;
                          grid-template-columns: 1fr 1.3fr;
                          gap: 24px;
                          align-items: center;
                          margin: 18px 0 34px;
                        ">
                          <figure
                            class="image-slot"
                            data-image-slot="true"
                            style="
                              position: relative;
                              height: 260px;
                              border-radius: 18px;
                              overflow: hidden;
                              margin: 0;
                            "
                          >
                            <img
                              src="${svgPlaceholder(380, 260, 'Click to add image')}"
                              alt="Placeholder"
                              style="width: 100%; height: 100%; object-fit: cover; display: block;"
                            />
                          </figure>
                          <div>
                            <h3 style="margin: 0 0 10px;">Header</h3>
                            <p style="margin: 0; line-height: 1.6;">
                              Write your section text here…
                            </p>
                          </div>
                        </div>

                        <!-- Row 3 -->
                        <div style="
                          display: grid;
                          grid-template-columns: 1.3fr 1fr;
                          gap: 24px;
                          align-items: center;
                          margin: 18px 0 34px;
                        ">
                          <div>
                            <h3 style="margin: 0 0 10px;">Header</h3>
                            <p style="margin: 0; line-height: 1.6;">
                              Write your section text here…
                            </p>
                          </div>
                          <figure
                            class="image-slot"
                            data-image-slot="true"
                            style="
                              position: relative;
                              height: 260px;
                              border-radius: 18px;
                              overflow: hidden;
                              margin: 0;
                            "
                          >
                            <img
                              src="${svgPlaceholder(380, 260, 'Click to add image')}"
                              alt="Placeholder"
                              style="width: 100%; height: 100%; object-fit: cover; display: block;"
                            />
                          </figure>
                        </div>

                        <!-- Row 4 -->
                        <div style="
                          display: grid;
                          grid-template-columns: 1fr 1.3fr;
                          gap: 24px;
                          align-items: center;
                          margin: 18px 0 26px;
                        ">
                          <figure
                            class="image-slot"
                            data-image-slot="true"
                            style="
                              position: relative;
                              height: 260px;
                              border-radius: 18px;
                              overflow: hidden;
                              margin: 0;
                            "
                          >
                            <img
                              src="${svgPlaceholder(380, 260, 'Click to add image')}"
                              alt="Placeholder"
                              style="width: 100%; height: 100%; object-fit: cover; display: block;"
                            />
                          </figure>
                          <div>
                            <h3 style="margin: 0 0 10px;">Header</h3>
                            <p style="margin: 0; line-height: 1.6;">
                              Write your section text here…
                            </p>
                          </div>
                        </div>

                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin-top: 8px;" />
                      </div>
                    `,
                  },

                  // -----------------------------------
                  // Template 3: Left text / right stack
                  // -----------------------------------
                  {
                    title: 'Template 3 — Left Text / Right Image Stack',
                    description: 'Text sections stacked on left, images stacked on right',
                    content: `
                      <div style="max-width: 980px; margin: 0 auto;">
                        <div style="
                          display: grid;
                          grid-template-columns: 1.25fr 1fr;
                          gap: 28px;
                          align-items: flex-start;
                        ">

                          <!-- Left text column -->
                          <div>
                            <div style="margin: 0 0 34px;">
                              <h3 style="margin: 0 0 8px;">Header</h3>
                              <p style="margin: 0; line-height: 1.6;">
                                Write your section text here…
                              </p>
                            </div>

                            <div style="margin: 0 0 34px;">
                              <h3 style="margin: 0 0 8px;">Header</h3>
                              <p style="margin: 0; line-height: 1.6;">
                                Write your section text here…
                              </p>
                            </div>

                            <div style="margin: 0 0 34px;">
                              <h3 style="margin: 0 0 8px;">Header</h3>
                              <p style="margin: 0; line-height: 1.6;">
                                Write your section text here…
                              </p>
                            </div>

                            <div style="margin: 0;">
                              <h3 style="margin: 0 0 8px;">Header</h3>
                              <p style="margin: 0; line-height: 1.6;">
                                Write your section text here…
                              </p>
                            </div>
                          </div>

                          <!-- Right image stack -->
                          <div style="display: flex; flex-direction: column; gap: 22px;">
                            <figure
                              class="image-slot"
                              data-image-slot="true"
                              style="
                                position: relative;
                                height: 260px;
                                border-radius: 18px;
                                overflow: hidden;
                                margin: 0;
                              "
                            >
                              <img
                                src="${svgPlaceholder(420, 260, 'Click to add image')}"
                                alt="Placeholder"
                                style="width: 100%; height: 100%; object-fit: cover; display: block;"
                              />
                            </figure>

                            <figure
                              class="image-slot"
                              data-image-slot="true"
                              style="
                                position: relative;
                                height: 260px;
                                border-radius: 18px;
                                overflow: hidden;
                                margin: 0;
                              "
                            >
                              <img
                                src="${svgPlaceholder(420, 260, 'Click to add image')}"
                                alt="Placeholder"
                                style="width: 100%; height: 100%; object-fit: cover; display: block;"
                              />
                            </figure>

                            <figure
                              class="image-slot"
                              data-image-slot="true"
                              style="
                                position: relative;
                                height: 260px;
                                border-radius: 18px;
                                overflow: hidden;
                                margin: 0;
                              "
                            >
                              <img
                                src="${svgPlaceholder(420, 260, 'Click to add image')}"
                                alt="Placeholder"
                                style="width: 100%; height: 100%; object-fit: cover; display: block;"
                              />
                            </figure>
                          </div>

                        </div>
                      </div>
                    `,
                  },

                  // ---------------------------
                  // Template 4: Text-only long
                  // ---------------------------
                  {
                    title: 'Template 4 — Text-Only Article',
                    description: 'Large header + paragraphs + subheaders + divider + repeat',
                    content: `
                      <div style="max-width: 920px; margin: 0 auto;">
                        <h2 style="margin: 0 0 10px;">Header</h2>
                        <p style="margin: 0 0 28px; line-height: 1.7;">
                          Write your intro paragraph here…
                        </p>

                        <h3 style="margin: 0 0 8px;">Subheader</h3>
                        <p style="margin: 0 0 22px; line-height: 1.7;">
                          Write supporting content here…
                        </p>

                        <h3 style="margin: 0 0 8px;">Subheader</h3>
                        <p style="margin: 0 0 28px; line-height: 1.7;">
                          Write supporting content here…
                        </p>

                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

                        <h2 style="margin: 0 0 10px;">Header</h2>
                        <p style="margin: 0 0 28px; line-height: 1.7;">
                          Continue your article here…
                        </p>

                        <h3 style="margin: 0 0 8px;">Subheader</h3>
                        <p style="margin: 0 0 22px; line-height: 1.7;">
                          Add more details here…
                        </p>

                        <h3 style="margin: 0 0 8px;">Subheader</h3>
                        <p style="margin: 0; line-height: 1.7;">
                          Add more details here…
                        </p>
                      </div>
                    `,
                  },
                ],
              }}
              initialValue=""
            />
          </Box>

          {blogError && (
            <Typography color="error" style={{ marginTop: '8px' }}>
              {blogError}
            </Typography>
          )}
          {blogSuccess && (
            <Typography style={{ marginTop: '8px', color: 'green' }}>{blogSuccess}</Typography>
          )}

          <Box mt={2}>
            <Button
              variant="contained"
              onClick={handleCreateBlogPost}
              disabled={blogSaving}
              style={{
                backgroundColor: colors.red1,
                color: 'white',
                borderRadius: 8,
                padding: '10px 24px',
                alignSelf: 'flex-start',
              }}
            >
              {blogSaving
                ? 'Saving…'
                : blogVisibility === 'ARCHIVED'
                ? 'Save (Archived)'
                : 'Publish Post'}
            </Button>
          </Box>
        </Box>
      </Box>
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

          {/* Database / Maintenance Section */}
          <Box
            style={{
              marginBottom: '40px',
              padding: '20px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
            }}
          >
            <Typography variant="h5" style={{ marginBottom: '15px', fontWeight: 'bold' }}>
              Database Initialization
            </Typography>
            <Typography variant="body1" style={{ marginBottom: '15px', color: '#666' }}>
              Initialize required Firestore collections in production. Safe to run multiple times —
              never overwrites existing documents. Run this once after first deployment.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleInitCollections}
              disabled={initStatus === 'running'}
            >
              {initStatus === 'running' ? 'Running…' : 'Initialize Collections'}
            </Button>
            {initResults.length > 0 && (
              <Box style={{ marginTop: '15px' }}>
                {initResults.map((r, i) => (
                  <Typography
                    key={i}
                    variant="body2"
                    style={{ color: initStatus === 'error' ? 'red' : 'green' }}
                  >
                    {r}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>

          <Box
            style={{
              marginBottom: '40px',
              padding: '20px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
            }}
          >
            <Typography variant="h5" style={{ marginBottom: '15px', fontWeight: 'bold' }}>
              Web Scraper
            </Typography>
            <Typography variant="body1" style={{ marginBottom: '15px', color: '#666' }}>
              Scrapes property data from registered agency websites (e.g. PJ Apartments) and
              compares results against the current database. Downloads a CSV showing new listings
              and changed fields (beds, baths, price) that you can review before applying updates.
            </Typography>

            <Box style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleRunScraper}
                disabled={scraperStatus === 'running'}
              >
                {scraperStatus === 'running' ? 'Scraping...' : 'Run Scraper'}
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleDownloadScraperCSV}
                disabled={scraperStatus === 'running' || scraperStatus === 'idle'}
              >
                Download Results CSV
              </Button>
            </Box>

            {scraperStatus === 'running' && (
              <Box
                style={{
                  padding: '10px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                }}
              >
                <Typography variant="body2" style={{ fontFamily: 'monospace' }}>
                  Scraping in progress — this may take a minute...
                </Typography>
              </Box>
            )}

            {scraperStatus === 'error' && (
              <Box
                style={{
                  padding: '10px',
                  backgroundColor: '#fff3f3',
                  borderRadius: '4px',
                  border: '1px solid #ffcdd2',
                }}
              >
                <Typography variant="body2" style={{ fontFamily: 'monospace', color: 'red' }}>
                  Error: {scraperError}
                </Typography>
              </Box>
            )}

            {scraperStatus === 'done' && scraperSummary && (
              <Box
                style={{
                  padding: '15px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                }}
              >
                <Typography variant="body2" style={{ marginBottom: '8px', fontWeight: 'bold' }}>
                  Scrape Complete:
                </Typography>
                <Typography variant="body2" style={{ fontFamily: 'monospace' }}>
                  Total scraped: {scraperSummary.total}
                </Typography>
                <Typography variant="body2" style={{ fontFamily: 'monospace', color: '#1565c0' }}>
                  New (not in DB): {scraperSummary.newCount}
                </Typography>
                <Typography variant="body2" style={{ fontFamily: 'monospace', color: '#e65100' }}>
                  Changed (beds/baths/price differ): {scraperSummary.changedCount}
                </Typography>
                <Typography variant="body2" style={{ fontFamily: 'monospace', color: 'green' }}>
                  Unchanged: {scraperSummary.unchangedCount}
                </Typography>
                {scraperSummary.scraperErrors && scraperSummary.scraperErrors.length > 0 && (
                  <Box style={{ marginTop: '10px' }}>
                    <Typography variant="body2" style={{ fontWeight: 'bold', color: 'red' }}>
                      Agency errors:
                    </Typography>
                    {scraperSummary.scraperErrors.map(
                      (e: { agency: string; message: string }, idx: number) => (
                        <Typography
                          key={idx}
                          variant="body2"
                          style={{ fontFamily: 'monospace', fontSize: '11px' }}
                        >
                          {e.agency}: {e.message}
                        </Typography>
                      )
                    )}
                  </Box>
                )}
                <Typography
                  variant="body2"
                  style={{ marginTop: '10px', color: '#666', fontSize: '12px' }}
                >
                  Download the CSV, review/edit changes, then run{' '}
                  <code>yarn update_apartments</code> to apply updates to the database.
                </Typography>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );

  // Admin Management tab
  const adminManagement = (
    <Container className={container}>
      <Box mt={4} mb={4}>
        <Typography variant="h3" style={{ marginBottom: '8px' }}>
          <strong>Admin Management</strong>
        </Typography>
        <Typography variant="body2" style={{ color: '#666', marginBottom: '24px' }}>
          Manage who can access the admin panel. Superadmins are hardcoded in the codebase and
          cannot be removed here. Whitelist admins are stored in Firestore and can be added or
          removed at any time.
        </Typography>

        {whitelistError && (
          <Typography variant="body2" style={{ color: 'red', marginBottom: '16px' }}>
            {whitelistError}
          </Typography>
        )}

        {/* Add new admin */}
        <Box
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
            marginBottom: '32px',
          }}
        >
          <TextField
            label="Cornell email"
            variant="outlined"
            size="small"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            placeholder="netid@cornell.edu"
            style={{ width: '300px' }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddAdmin}
            disabled={addingAdmin || !newAdminEmail.trim()}
          >
            {addingAdmin ? 'Adding…' : 'Add Admin'}
          </Button>
          <Button variant="outlined" onClick={fetchWhitelist} disabled={whitelistLoading}>
            {whitelistLoading ? 'Loading…' : 'Refresh'}
          </Button>
        </Box>

        {/* Superadmins (read-only) */}
        <Typography variant="h5" style={{ marginBottom: '12px', fontWeight: 'bold' }}>
          Superadmins (hardcoded)
        </Typography>
        <Table size="small" style={{ marginBottom: '32px' }}>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {superadmins.map((email) => (
              <TableRow key={email}>
                <TableCell>{email}</TableCell>
                <TableCell style={{ color: '#888' }}>
                  Superadmin — edit HomeConsts.ts to remove
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Firestore whitelist */}
        <Typography variant="h5" style={{ marginBottom: '12px', fontWeight: 'bold' }}>
          Whitelist Admins (Firestore)
        </Typography>
        {whitelist.length === 0 && !whitelistLoading ? (
          <Typography variant="body2" style={{ color: '#888', marginBottom: '16px' }}>
            No whitelist admins yet. Click "Refresh" to load or add one above.
          </Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Added By</TableCell>
                <TableCell>Added At</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {whitelist.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.email}</TableCell>
                  <TableCell>{entry.addedBy ?? '—'}</TableCell>
                  <TableCell>
                    {entry.addedAt
                      ? new Date(
                          typeof entry.addedAt === 'object'
                            ? entry.addedAt._seconds * 1000
                            : entry.addedAt
                        ).toLocaleDateString()
                      : '—'}
                  </TableCell>
                  <TableCell>
                    {confirmRemoveEmail === entry.email ? (
                      <Box style={{ display: 'flex', gap: '8px' }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="secondary"
                          disabled={removingId === entry.id}
                          onClick={() => handleRemoveAdmin(entry.email, entry.id)}
                        >
                          {removingId === entry.id ? 'Removing…' : 'Confirm Remove'}
                        </Button>
                        <Button size="small" onClick={() => setConfirmRemoveEmail(null)}>
                          Cancel
                        </Button>
                      </Box>
                    ) : (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setConfirmRemoveEmail(entry.email)}
                      >
                        Remove
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Box>
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
                variant="contained"
                color="primary"
                onClick={handleOpenCreateModal}
                style={{ marginRight: '10px' }}
              >
                + Create New Apartment
              </Button>
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
            <Tab label="Blog Posts" value="BlogPost" />
            <Tab label="Apartment Data" value="Data" />
            <Tab label="Dev Tools" value="DevTools" />
            <Tab label="Admin Management" value="AdminManagement" />
          </Tabs>
        </Toolbar>
      </AppBar>

      {selectedTab === 'Reviews' && reviews}
      {selectedTab === 'Contact' && contact}
      {selectedTab === 'BlogPost' && blogPosts}
      {selectedTab === 'Data' && data}
      {selectedTab === 'DevTools' && developerTools}
      {selectedTab === 'AdminManagement' && adminManagement}
      {Modals}
      {roomTypesModal}

      {/* Create New Apartment Modal */}
      <Dialog open={createModalOpen} onClose={handleCloseCreateModal} maxWidth="md" fullWidth>
        <DialogTitle>Create New Apartment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} style={{ marginTop: '10px' }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Apartment Name"
                value={newApartmentName}
                onChange={(e) => setNewApartmentName(e.target.value)}
                placeholder="e.g., 112 Edgemoor Lane"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Address"
                value={newApartmentAddress}
                onChange={(e) => setNewApartmentAddress(e.target.value)}
                placeholder="e.g., 112 Edgemoor Lane, Ithaca, NY 14850"
                helperText="Full address will be used to calculate location and distance"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Landlord ID"
                value={newApartmentLandlordId}
                onChange={(e) => setNewApartmentLandlordId(e.target.value)}
                placeholder="Enter landlord ID"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                select
                label="Area"
                value={newApartmentArea}
                onChange={(e) => setNewApartmentArea(e.target.value as any)}
                SelectProps={{ native: true }}
              >
                <option value="COLLEGETOWN">Collegetown</option>
                <option value="WEST">West</option>
                <option value="NORTH">North</option>
                <option value="DOWNTOWN">Downtown</option>
                <option value="OTHER">Other</option>
              </TextField>
            </Grid>

            {/* Error Display */}
            {createError && (
              <Grid item xs={12}>
                <Box
                  style={{
                    padding: '10px',
                    backgroundColor: '#ffebee',
                    borderRadius: '4px',
                    color: '#c62828',
                  }}
                >
                  <Typography variant="body2">{createError}</Typography>
                </Box>
              </Grid>
            )}

            {/* Preview Data Display */}
            {previewData && (
              <Grid item xs={12}>
                <Box
                  style={{
                    padding: '15px',
                    backgroundColor: '#e8f5e9',
                    borderRadius: '4px',
                    marginTop: '10px',
                  }}
                >
                  <Typography variant="h6" style={{ marginBottom: '10px', fontWeight: 'bold' }}>
                    Preview - Calculated Location Data
                  </Typography>
                  <Typography variant="body2" style={{ marginBottom: '5px' }}>
                    <strong>Latitude:</strong> {previewData.coordinates?.latitude.toFixed(6)}
                  </Typography>
                  <Typography variant="body2" style={{ marginBottom: '5px' }}>
                    <strong>Longitude:</strong> {previewData.coordinates?.longitude.toFixed(6)}
                  </Typography>
                  <Typography variant="body2" style={{ marginBottom: '5px' }}>
                    <strong>Distance to Campus:</strong>{' '}
                    {previewData.apartmentData?.distanceToCampus.toFixed(2)} miles
                  </Typography>
                  <Typography variant="body2" style={{ marginTop: '10px', fontStyle: 'italic' }}>
                    Click "Confirm & Create" to save this apartment to the database.
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateModal} color="default">
            Cancel
          </Button>
          {!previewData ? (
            <Button
              onClick={handlePreviewApartment}
              color="primary"
              variant="outlined"
              disabled={createStatus === 'preview'}
            >
              {createStatus === 'preview' ? 'Calculating...' : 'Preview Location'}
            </Button>
          ) : (
            <Button
              onClick={handleConfirmCreate}
              color="primary"
              variant="contained"
              disabled={createStatus === 'creating'}
            >
              {createStatus === 'creating' ? 'Creating...' : 'Confirm & Create'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdminPage;
