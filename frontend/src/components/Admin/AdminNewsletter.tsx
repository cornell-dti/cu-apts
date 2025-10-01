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
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

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
}));

/**
 * AdminNewsletter - Displays a form to fill out and send a newsletter.
 *
 * @returns {ReactElement} - A Material-UI form for newsletter generation
 */
const AdminNewsletter = () => {
  const classes = useStyles();
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

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleSectionToggle = (section: keyof typeof sections) => {
    setSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className={classes.root}>
      <Modal
        open={showModal}
        onClose={closeModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className={classes.modalBox}>
          <Typography variant="h6" component="h2" gutterBottom>
            IMPORTANT: Confirm Send
          </Typography>
          <Typography id="modal-modal-title">
            This newsletter will be sent to all subscribers. Please make sure that you have tested
            the content and formatting by sending a single test email to yourself. Are you sure you
            want to continue?
          </Typography>
          <Button variant="contained" color="primary" onClick={closeModal}>
            Send to all users
          </Button>
        </Box>
      </Modal>

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
      />

      <TextField
        label="Introduction Text"
        variant="outlined"
        fullWidth
        multiline
        rows={3}
        required
        placeholder="Write the opening message for your newsletter"
      />

      <TextField
        label="Header Image URL"
        variant="outlined"
        fullWidth
        type="url"
        placeholder="https://example.com/header.jpg"
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
            />
            <TextField
              label="Budget Friendly Property IDs"
              variant="outlined"
              fullWidth
              placeholder="e.g., 123, 456, 789"
              helperText="Comma-separated property IDs"
            />
          </AccordionDetails>
        </Accordion>
      </div>

      {/* Top Loved Properties Section */}
      <div>
        <FormControlLabel
          control={
            <Checkbox
              checked={sections.topLoved}
              onChange={() => handleSectionToggle('topLoved')}
              color="primary"
            />
          }
          label="Include Top Loved Properties Section"
        />
        <Accordion disabled={!sections.topLoved} expanded={sections.topLoved}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Top Loved Properties</Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.accordionDetails}>
            <TextField
              label="Highest Rated Property IDs"
              variant="outlined"
              fullWidth
              placeholder="e.g., 123, 456, 789"
              helperText="Comma-separated property IDs"
            />
            <TextField
              label="Most Reviewed Property IDs"
              variant="outlined"
              fullWidth
              placeholder="e.g., 123, 456, 789"
              helperText="Comma-separated property IDs"
            />
            <TextField
              label="Property Testimony"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              placeholder="Enter a testimonial from a resident"
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
              label="Advice Content"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              placeholder="Enter advice from an upperclassman"
            />
            <TextField
              label="Upperclassman Info"
              variant="outlined"
              fullWidth
              placeholder="e.g., Sarah M., Class of 2024"
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
            />
            <TextField
              label="Feature Title"
              variant="outlined"
              fullWidth
              placeholder="Enter feature name"
            />
            <TextField
              label="Feature Description"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              placeholder="Describe the new feature"
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
            />
            <TextField
              label="Neighborhood 1 Image URL"
              variant="outlined"
              fullWidth
              type="url"
              placeholder="https://example.com/neighborhood1.jpg"
            />
            <TextField
              label="Neighborhood 1 Description"
              variant="outlined"
              fullWidth
              multiline
              rows={2}
              placeholder="Describe this neighborhood"
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
            />
            <TextField
              label="Neighborhood 2 Image URL"
              variant="outlined"
              fullWidth
              type="url"
              placeholder="https://example.com/neighborhood2.jpg"
            />
            <TextField
              label="Neighborhood 2 Description"
              variant="outlined"
              fullWidth
              multiline
              rows={2}
              placeholder="Describe this neighborhood"
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
            />
            <TextField
              label="Area Description"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              placeholder="Describe this area"
            />
            <TextField
              label="Area Image URL"
              variant="outlined"
              fullWidth
              type="url"
              placeholder="https://example.com/area.jpg"
            />
            <TextField
              label="Recently Released Property IDs"
              variant="outlined"
              fullWidth
              placeholder="e.g., 123, 456, 789"
              helperText="Comma-separated property IDs"
            />
            <TextField
              label="Things to Do"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              placeholder="List activities and attractions in this area"
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
            />
            <TextField
              label="Sublease Description"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              placeholder="Describe the sublease opportunity"
            />
            <TextField
              label="Sublease Link"
              variant="outlined"
              fullWidth
              type="url"
              placeholder="https://example.com/sublease/123"
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
            />
            <TextField
              label="Reel Description"
              variant="outlined"
              fullWidth
              multiline
              rows={2}
              placeholder="Describe the reel content"
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
      />

      <div className={classes.buttonContainer}>
        <Button variant="contained" color="primary">
          Send Test Email
        </Button>
        <Button variant="contained" color="secondary" onClick={openModal}>
          Send to All Subscribers
        </Button>
      </div>
    </div>
  );
};

export default AdminNewsletter;
