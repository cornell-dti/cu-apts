import React, { useState } from 'react';
import {
  Button,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  Typography,
  Modal,
  Box,
  CircularProgress,
  Snackbar,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { makeStyles } from '@material-ui/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { getUser } from '../../utils/firebase';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    maxWidth: '800px',
    padding: '20px',
  },
  modalBox: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    backgroundColor: 'white',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
    padding: '32px',
    borderRadius: '8px',
  },
  sectionTitle: {
    marginTop: '20px',
    marginBottom: '10px',
  },
  accordionDetails: {
    flexDirection: 'column',
    gap: '15px',
  },
  neighborhoodSubtitle: {
    marginTop: '15px',
  },
  sendTitle: {
    marginTop: '30px',
    marginBottom: '10px',
  },
  buttonContainer: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
  },
  modalButtonContainer: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
  },
}));

const AdminNewsletter = () => {
  const classes = useStyles();

  // UI state
  const [sections, setSections] = useState({
    recentlyReleased: false,
    topLoved: false,
    advice: false,
    newFeature: false,
    neighborhood: false,
    areaSpotlight: false,
    sublease: false,
    reels: false,
  });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Form data state
  const [formData, setFormData] = useState({
    subject: '',
    introductionMessage: '',
    headerImageUrl: '',
    testEmail: '',
    // Recently Released
    nearbyPropertyIDs: '',
    budgetPropertyIDs: '',
    // Top Loved
    lovedPropertyIDs: '',
    reviewedPropertyIDs: '',
    propertyReview: '',
    // Advice
    adviceName: '',
    adviceMessage: '',
    adviceMajor: '',
    adviceYear: '',
    adviceApartment: '',
    // New Feature
    featureImgUrl: '',
    featureTitle: '',
    featureDescription: '',
    // Neighborhood
    neighborhood1Name: '',
    neighborhood1Image: '',
    neighborhood1Description: '',
    neighborhood2Name: '',
    neighborhood2Image: '',
    neighborhood2Description: '',
    // Area Spotlight
    areaName: '',
    areaDescription: '',
    areaImage: '',
    areaPropertyIDs: '',
    areaActivities: '',
    // Sublease
    subleaseImage: '',
    subleaseDescription: '',
    subleasePhone: '',
    subleaseEmail: '',
    // Reels
    reelsGifUrl: '',
    reelsDescription: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSectionToggle = (section: keyof typeof sections) => {
    setSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const parsePropertyIDs = (ids: string): string[] => {
    return ids
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id !== '');
  };

  const parseActivities = (activitiesStr: string) => {
    if (!activitiesStr.trim()) return [];

    try {
      // Expect format: "Name1|Address1|ImageUrl1;Name2|Address2|ImageUrl2"
      return activitiesStr
        .split(';')
        .map((activity) => {
          const [name, address, imgUrl] = activity.split('|').map((s) => s.trim());
          return { name, address, imgUrl };
        })
        .filter((a) => a.name && a.address && a.imgUrl);
    } catch {
      return [];
    }
  };

  const buildNewsletterPayload = (sendToAll: boolean) => {
    const payload: any = {
      subject: formData.subject,
      introductionMessage: formData.introductionMessage,
      headerImageUrl: formData.headerImageUrl || undefined,
      testEmail: formData.testEmail || undefined,
      sendToAll,
      sections: {},
    };

    if (sections.recentlyReleased) {
      payload.sections.recentlyReleased = {
        nearbyPropertyIDs: parsePropertyIDs(formData.nearbyPropertyIDs),
        budgetPropertyIDs: parsePropertyIDs(formData.budgetPropertyIDs),
      };
    }

    if (sections.topLoved) {
      payload.sections.topLoved = {
        lovedPropertyIDs: parsePropertyIDs(formData.lovedPropertyIDs),
        reviewedPropertyIDs: parsePropertyIDs(formData.reviewedPropertyIDs),
        propertyReview: formData.propertyReview,
      };
    }

    if (sections.advice) {
      payload.sections.advice = {
        name: formData.adviceName,
        message: formData.adviceMessage,
        major: formData.adviceMajor,
        year: formData.adviceYear,
        apartment: formData.adviceApartment,
      };
    }

    if (sections.newFeature) {
      payload.sections.newFeature = {
        imgUrl: formData.featureImgUrl,
        featureName: formData.featureTitle,
        description: formData.featureDescription,
      };
    }

    if (sections.neighborhood) {
      payload.sections.neighborhood = {
        name1: formData.neighborhood1Name,
        name2: formData.neighborhood2Name,
        description1: formData.neighborhood1Description,
        description2: formData.neighborhood2Description,
        image1: formData.neighborhood1Image,
        image2: formData.neighborhood2Image,
      };
    }

    if (sections.areaSpotlight) {
      payload.sections.areaSpotlight = {
        name: formData.areaName,
        description: formData.areaDescription,
        imageURL: formData.areaImage,
        recentAreaPropertyIDs: parsePropertyIDs(formData.areaPropertyIDs),
        activities: parseActivities(formData.areaActivities),
      };
    }

    if (sections.sublease) {
      payload.sections.sublease = {
        imgUrl: formData.subleaseImage,
        description: formData.subleaseDescription,
        phoneNumber: formData.subleasePhone || undefined,
        email: formData.subleaseEmail,
      };
    }

    if (sections.reels) {
      payload.sections.reels = {
        gifUrl: formData.reelsGifUrl,
        description: formData.reelsDescription,
      };
    }

    return payload;
  };

  const sendNewsletter = async (sendToAll: boolean) => {
    if (!formData.subject || !formData.introductionMessage) {
      setSnackbar({
        open: true,
        message: 'Subject and introduction message are required',
        severity: 'error',
      });
      return;
    }

    if (!sendToAll && !formData.testEmail) {
      setSnackbar({
        open: true,
        message: 'Test email address is required',
        severity: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      const payload = buildNewsletterPayload(sendToAll);

      // Get Firebase auth token
      const user = await getUser(true);
      if (!user) {
        throw new Error('Failed to login');
      }
      const token = await user.getIdToken();

      const response = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send newsletter');
      }

      setSnackbar({
        open: true,
        message: data.message,
        severity: 'success',
      });

      if (sendToAll) {
        setShowModal(false);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to send newsletter',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.root}>
      {/* Confirmation Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <Box className={classes.modalBox}>
          <Typography variant="h6" component="h2" gutterBottom>
            IMPORTANT: Confirm Send
          </Typography>
          <Typography>
            This newsletter will be sent to all subscribers. Please make sure that you have tested
            the content and formatting by sending a single test email to yourself. Are you sure you
            want to continue?
          </Typography>
          <div className={classes.modalButtonContainer}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => sendNewsletter(true)}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Send to all users'}
            </Button>
            <Button variant="outlined" onClick={() => setShowModal(false)} disabled={loading}>
              Cancel
            </Button>
          </div>
        </Box>
      </Modal>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Typography variant="h4" component="h2">
        Newsletter Generation
      </Typography>

      {/* Required Fields */}
      <TextField
        label="Subject Line"
        variant="outlined"
        fullWidth
        required
        placeholder="Enter email subject"
        value={formData.subject}
        onChange={(e) => handleInputChange('subject', e.target.value)}
      />

      <TextField
        label="Introduction Text"
        variant="outlined"
        fullWidth
        multiline
        rows={3}
        required
        placeholder="Write the opening message for your newsletter"
        value={formData.introductionMessage}
        onChange={(e) => handleInputChange('introductionMessage', e.target.value)}
      />

      <TextField
        label="Header Image URL"
        variant="outlined"
        fullWidth
        type="url"
        placeholder="https://example.com/header.jpg"
        value={formData.headerImageUrl}
        onChange={(e) => handleInputChange('headerImageUrl', e.target.value)}
      />

      <Typography variant="h6" className={classes.sectionTitle}>
        Optional Sections
      </Typography>

      {/* Recently Released Section */}
      <div>
        <FormControlLabel
          control={
            <Checkbox
              checked={sections.recentlyReleased}
              onChange={() => handleSectionToggle('recentlyReleased')}
              color="primary"
            />
          }
          label="Include Recently Released Section"
        />
        <Accordion disabled={!sections.recentlyReleased} expanded={sections.recentlyReleased}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Recently Released Properties</Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.accordionDetails}>
            <TextField
              label="Close to Campus Property IDs"
              variant="outlined"
              fullWidth
              placeholder="e.g., 123, 456, 789"
              helperText="Comma-separated property IDs"
              value={formData.nearbyPropertyIDs}
              onChange={(e) => handleInputChange('nearbyPropertyIDs', e.target.value)}
            />
            <TextField
              label="Budget Friendly Property IDs"
              variant="outlined"
              fullWidth
              placeholder="e.g., 123, 456, 789"
              helperText="Comma-separated property IDs"
              value={formData.budgetPropertyIDs}
              onChange={(e) => handleInputChange('budgetPropertyIDs', e.target.value)}
            />
          </AccordionDetails>
        </Accordion>
      </div>

      {/* Top Loved Section */}
      <div>
        <FormControlLabel
          control={
            <Checkbox
              checked={sections.topLoved}
              onChange={() => handleSectionToggle('topLoved')}
              color="primary"
            />
          }
          label="Include Top Loved Section"
        />
        <Accordion disabled={!sections.topLoved} expanded={sections.topLoved}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Top Loved Properties</Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.accordionDetails}>
            <TextField
              label="Loved Property IDs"
              variant="outlined"
              fullWidth
              placeholder="e.g., 123, 456, 789"
              helperText="Comma-separated property IDs"
              value={formData.lovedPropertyIDs}
              onChange={(e) => handleInputChange('lovedPropertyIDs', e.target.value)}
            />
            <TextField
              label="Reviewed Property IDs"
              variant="outlined"
              fullWidth
              placeholder="e.g., 123, 456, 789"
              helperText="Comma-separated property IDs"
              value={formData.reviewedPropertyIDs}
              onChange={(e) => handleInputChange('reviewedPropertyIDs', e.target.value)}
            />
            <TextField
              label="Property Review"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              placeholder="Enter a testimonial from a resident"
              value={formData.propertyReview}
              onChange={(e) => handleInputChange('propertyReview', e.target.value)}
            />
          </AccordionDetails>
        </Accordion>
      </div>

      {/* Advice from Upperclassmen Section */}
      <div>
        <FormControlLabel
          control={
            <Checkbox
              checked={sections.advice}
              onChange={() => handleSectionToggle('advice')}
              color="primary"
            />
          }
          label="Include Advice from Upperclassmen Section"
        />
        <Accordion disabled={!sections.advice} expanded={sections.advice}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Advice from Upperclassmen</Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.accordionDetails}>
            <TextField
              label="Student Name"
              variant="outlined"
              fullWidth
              placeholder="e.g., Sarah M."
              value={formData.adviceName}
              onChange={(e) => handleInputChange('adviceName', e.target.value)}
            />
            <TextField
              label="Advice Content"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              placeholder="Enter advice from an upperclassman"
              value={formData.adviceMessage}
              onChange={(e) => handleInputChange('adviceMessage', e.target.value)}
            />
            <TextField
              label="Major"
              variant="outlined"
              fullWidth
              placeholder="e.g., Computer Science"
              value={formData.adviceMajor}
              onChange={(e) => handleInputChange('adviceMajor', e.target.value)}
            />
            <TextField
              label="Class Year"
              variant="outlined"
              fullWidth
              placeholder="e.g., 2024"
              value={formData.adviceYear}
              onChange={(e) => handleInputChange('adviceYear', e.target.value)}
            />
            <TextField
              label="Apartment Name"
              variant="outlined"
              fullWidth
              placeholder="e.g., Collegetown Crossings"
              value={formData.adviceApartment}
              onChange={(e) => handleInputChange('adviceApartment', e.target.value)}
            />
          </AccordionDetails>
        </Accordion>
      </div>

      {/* New Feature Spotlight Section */}
      <div>
        <FormControlLabel
          control={
            <Checkbox
              checked={sections.newFeature}
              onChange={() => handleSectionToggle('newFeature')}
              color="primary"
            />
          }
          label="Include New Feature Spotlight Section"
        />
        <Accordion disabled={!sections.newFeature} expanded={sections.newFeature}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>New Feature Spotlight</Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.accordionDetails}>
            <TextField
              label="Feature Image URL"
              variant="outlined"
              fullWidth
              type="url"
              placeholder="https://example.com/feature.jpg"
              value={formData.featureImgUrl}
              onChange={(e) => handleInputChange('featureImgUrl', e.target.value)}
            />
            <TextField
              label="Feature Title"
              variant="outlined"
              fullWidth
              placeholder="Enter feature name"
              value={formData.featureTitle}
              onChange={(e) => handleInputChange('featureTitle', e.target.value)}
            />
            <TextField
              label="Feature Description"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              placeholder="Describe the new feature"
              value={formData.featureDescription}
              onChange={(e) => handleInputChange('featureDescription', e.target.value)}
            />
          </AccordionDetails>
        </Accordion>
      </div>

      {/* Neighborhood Comparison Section */}
      <div>
        <FormControlLabel
          control={
            <Checkbox
              checked={sections.neighborhood}
              onChange={() => handleSectionToggle('neighborhood')}
              color="primary"
            />
          }
          label="Include Neighborhood Comparison Section"
        />
        <Accordion disabled={!sections.neighborhood} expanded={sections.neighborhood}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Neighborhood Comparison</Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.accordionDetails}>
            <Typography variant="subtitle2" color="textSecondary">
              Neighborhood 1
            </Typography>
            <TextField
              label="Neighborhood 1 Name"
              variant="outlined"
              fullWidth
              placeholder="e.g., Collegetown"
              value={formData.neighborhood1Name}
              onChange={(e) => handleInputChange('neighborhood1Name', e.target.value)}
            />
            <TextField
              label="Neighborhood 1 Image URL"
              variant="outlined"
              fullWidth
              type="url"
              placeholder="https://example.com/neighborhood1.jpg"
              value={formData.neighborhood1Image}
              onChange={(e) => handleInputChange('neighborhood1Image', e.target.value)}
            />
            <TextField
              label="Neighborhood 1 Description"
              variant="outlined"
              fullWidth
              multiline
              rows={2}
              placeholder="Describe this neighborhood"
              value={formData.neighborhood1Description}
              onChange={(e) => handleInputChange('neighborhood1Description', e.target.value)}
            />

            <Typography
              variant="subtitle2"
              color="textSecondary"
              className={classes.neighborhoodSubtitle}
            >
              Neighborhood 2
            </Typography>
            <TextField
              label="Neighborhood 2 Name"
              variant="outlined"
              fullWidth
              placeholder="e.g., Downtown"
              value={formData.neighborhood2Name}
              onChange={(e) => handleInputChange('neighborhood2Name', e.target.value)}
            />
            <TextField
              label="Neighborhood 2 Image URL"
              variant="outlined"
              fullWidth
              type="url"
              placeholder="https://example.com/neighborhood2.jpg"
              value={formData.neighborhood2Image}
              onChange={(e) => handleInputChange('neighborhood2Image', e.target.value)}
            />
            <TextField
              label="Neighborhood 2 Description"
              variant="outlined"
              fullWidth
              multiline
              rows={2}
              placeholder="Describe this neighborhood"
              value={formData.neighborhood2Description}
              onChange={(e) => handleInputChange('neighborhood2Description', e.target.value)}
            />
          </AccordionDetails>
        </Accordion>
      </div>

      {/* Area Spotlight Section */}
      <div>
        <FormControlLabel
          control={
            <Checkbox
              checked={sections.areaSpotlight}
              onChange={() => handleSectionToggle('areaSpotlight')}
              color="primary"
            />
          }
          label="Include Area Spotlight Section"
        />
        <Accordion disabled={!sections.areaSpotlight} expanded={sections.areaSpotlight}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Area Spotlight</Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.accordionDetails}>
            <TextField
              label="Area Name"
              variant="outlined"
              fullWidth
              placeholder="e.g., West Campus"
              value={formData.areaName}
              onChange={(e) => handleInputChange('areaName', e.target.value)}
            />
            <TextField
              label="Area Description"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              placeholder="Describe this area"
              value={formData.areaDescription}
              onChange={(e) => handleInputChange('areaDescription', e.target.value)}
            />
            <TextField
              label="Area Image URL"
              variant="outlined"
              fullWidth
              type="url"
              placeholder="https://example.com/area.jpg"
              value={formData.areaImage}
              onChange={(e) => handleInputChange('areaImage', e.target.value)}
            />
            <TextField
              label="Recently Released IDs"
              variant="outlined"
              fullWidth
              placeholder="e.g., 123, 456, 789"
              helperText="Comma-separated property IDs"
              value={formData.areaPropertyIDs}
              onChange={(e) => handleInputChange('areaPropertyIDs', e.target.value)}
            />
            <TextField
              label="Things to Do"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              placeholder="Name1|Address1|ImageUrl1;Name2|Address2|ImageUrl2"
              helperText="Format: Name|Address|ImageUrl separated by semicolons"
              value={formData.areaActivities}
              onChange={(e) => handleInputChange('areaActivities', e.target.value)}
            />
          </AccordionDetails>
        </Accordion>
      </div>

      {/* Sublease Spotlight Section */}
      <div>
        <FormControlLabel
          control={
            <Checkbox
              checked={sections.sublease}
              onChange={() => handleSectionToggle('sublease')}
              color="primary"
            />
          }
          label="Include Sublease Spotlight Section"
        />
        <Accordion disabled={!sections.sublease} expanded={sections.sublease}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Sublease Spotlight</Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.accordionDetails}>
            <TextField
              label="Sublease Image URL"
              variant="outlined"
              fullWidth
              type="url"
              placeholder="https://example.com/sublease.jpg"
              value={formData.subleaseImage}
              onChange={(e) => handleInputChange('subleaseImage', e.target.value)}
            />
            <TextField
              label="Sublease Description"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              placeholder="Describe the sublease opportunity"
              value={formData.subleaseDescription}
              onChange={(e) => handleInputChange('subleaseDescription', e.target.value)}
            />
            <TextField
              label="Contact Email"
              variant="outlined"
              fullWidth
              type="email"
              placeholder="contact@example.com"
              value={formData.subleaseEmail}
              onChange={(e) => handleInputChange('subleaseEmail', e.target.value)}
            />
            <TextField
              label="Contact Phone (Optional)"
              variant="outlined"
              fullWidth
              type="tel"
              placeholder="123-456-7890"
              value={formData.subleasePhone}
              onChange={(e) => handleInputChange('subleasePhone', e.target.value)}
            />
          </AccordionDetails>
        </Accordion>
      </div>

      {/* Reels Section */}
      <div>
        <FormControlLabel
          control={
            <Checkbox
              checked={sections.reels}
              onChange={() => handleSectionToggle('reels')}
              color="primary"
            />
          }
          label="Include Reels Section"
        />
        <Accordion disabled={!sections.reels} expanded={sections.reels}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Reels</Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.accordionDetails}>
            <TextField
              label="Reel GIF URL"
              variant="outlined"
              fullWidth
              type="url"
              placeholder="https://example.com/reel.gif"
              value={formData.reelsGifUrl}
              onChange={(e) => handleInputChange('reelsGifUrl', e.target.value)}
            />
            <TextField
              label="Reel Description"
              variant="outlined"
              fullWidth
              multiline
              rows={2}
              placeholder="Describe the reel content"
              value={formData.reelsDescription}
              onChange={(e) => handleInputChange('reelsDescription', e.target.value)}
            />
          </AccordionDetails>
        </Accordion>
      </div>

      {/* Send Options */}
      <Typography variant="h6" className={classes.sendTitle}>
        Send Newsletter
      </Typography>

      <TextField
        label="Test Email Address"
        variant="outlined"
        fullWidth
        type="email"
        placeholder="test@example.com"
        helperText="Send a test to this email address"
        value={formData.testEmail}
        onChange={(e) => handleInputChange('testEmail', e.target.value)}
      />

      <div className={classes.buttonContainer}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => sendNewsletter(false)}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Send Test Email'}
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => setShowModal(true)}
          disabled={loading}
        >
          Send to All Subscribers
        </Button>
      </div>
    </div>
  );
};

export default AdminNewsletter;
