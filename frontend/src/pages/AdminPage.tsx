import React, { ReactElement, useEffect, useState } from 'react';
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
  TextField,
  MenuItem,
  Chip,
  Button,
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {
  CantFindApartmentFormWithId,
  QuestionFormWithId,
  ReviewWithId,
} from '../../../common/types/db-types';
import axios from 'axios';
import { getUser, createAuthHeaders, uploadFile } from '../utils/firebase';
import { get } from '../utils/call';
import AdminReviewComponent from '../components/Admin/AdminReview';
import { useTitle } from '../utils';
import { Chart } from 'react-google-charts';
import { sortReviews } from '../utils/sortReviews';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Editor } from '@tinymce/tinymce-react';
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

  const { container, sectionHeader, expand, expandOpen } = useStyles();

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

  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [blogPhotos, setBlogPhotos] = useState<string[]>([]);

  const [blogSaving, setBlogSaving] = useState(false);
  const [blogError, setBlogError] = useState<string | null>(null);
  const [blogSuccess, setBlogSuccess] = useState<string | null>(null);

  const normalize = (s: string) => s.trim().replace(/\s+/g, ' ');

  const addPhotoUrl = (raw: string) => {
    const url = normalize(raw);
    if (!url) return;

    if (!/^https?:\/\/.+/i.test(url)) {
      setBlogError('Photo must be a valid URL.');
      return;
    }

    setBlogPhotos((prev) => (prev.includes(url) ? prev : [...prev, url]));
  };

  const removePhotoUrl = (url: string) => setBlogPhotos((prev) => prev.filter((x) => x !== url));

  const tinyMceImagesUploadHandler = async (blobInfo: any, progress: (p: number) => void) => {
    const blob = blobInfo.blob();
    const file = new File([blob], blobInfo.filename(), { type: blob.type });
    progress?.(10);

    const url = await uploadFile(file); // your existing Firebase Storage uploader
    progress?.(100);

    return url; // TinyMCE will insert <img src="...">
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

    if (!blogTitle.trim() || !blogBlurb.trim() || !blogContent.trim()) {
      setBlogError('Title, blurb, and content are required.');
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
        photos: blogPhotos,
        visibility: blogVisibility, // "ACTIVATED" | "ARCHIVED"
        userId: user.uid,
        likes: 0,
        saves: 0,
      };

      await axios.post('/api/blog-post', payload, createAuthHeaders(token));

      setBlogSuccess('Blog post created!');
      setBlogTitle('');
      setBlogBlurb('');
      setBlogContent('');
      setBlogVisibility('ACTIVATED');
      setBlogTags([]);
      setBlogPhotos([]);
      setPhotoUrlInput('');
    } catch (err) {
      console.error(err);
      setBlogError('Failed to create blog post. Please try again.');
    } finally {
      setBlogSaving(false);
    }
  };

  useTitle('Admin');

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

          {/* Photos (URLs) */}
          <Box>
            <Box display="flex" gridGap={12}>
              <TextField
                label="Photo URL"
                variant="outlined"
                fullWidth
                value={photoUrlInput}
                onChange={(e) => setPhotoUrlInput(e.target.value)}
                helperText="Paste a Firebase Storage download URL and click Add"
                InputLabelProps={{ shrink: true }}
              />
              <Button
                variant="contained"
                onClick={() => {
                  setBlogError(null);
                  addPhotoUrl(photoUrlInput);
                  setPhotoUrlInput('');
                }}
                style={{ backgroundColor: colors.red1, color: 'white' }}
              >
                Add
              </Button>
            </Box>

            <Box mt={1} display="flex" flexDirection="column" gridGap={8}>
              {blogPhotos.map((url) => (
                <Box
                  key={url}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  style={{ border: '1px solid #E5E7EB', borderRadius: 8, padding: 12 }}
                >
                  <Box style={{ maxWidth: '75%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <Typography variant="body2" noWrap>
                      {url}
                    </Typography>
                  </Box>
                  <Button onClick={() => removePhotoUrl(url)}>Remove</Button>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Content */}
          <Box mt={2}>
            <Typography variant="h6" style={{ marginBottom: '8px' }}>
              Content
            </Typography>

            <Editor
              apiKey="nlqgp4abfsx0n7eulsckg9qd2g31788bz0y3gxatyvj8m41p"
              value={blogContent}
              onEditorChange={(newContent) => setBlogContent(newContent)}
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
                  'media',
                  'searchreplace',
                  'table',
                  'visualblocks',
                  'wordcount',
                  'image',
                  'template',
                ],
                toolbar:
                  'undo redo | blocks | bold italic underline | link media table image | ' +
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
                automatic_uploads: true,
                images_upload_handler: (blobInfo, success, failure, progress) => {
                  tinyMceImagesUploadHandler(blobInfo, progress as any)
                    .then((url) => success(url))
                    .catch((err) => failure(err?.message ?? 'Image upload failed'));
                },
                paste_data_images: true,
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
            <Tab label="BlogPost" value="BlogPost" />
          </Tabs>
        </Toolbar>
      </AppBar>

      {selectedTab === 'Reviews' && reviews}
      {selectedTab === 'Contact' && contact}
      {selectedTab === 'BlogPost' && blogPosts}
      {Modals}
    </div>
  );
};

export default AdminPage;
