import React, { ReactElement } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Grid,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { createAuthHeaders, getUser } from '../../utils/firebase';
import { colors } from '../../colors';
import axios from 'axios';

const useStyles = makeStyles(() => ({
  root: {
    borderRadius: '10px',
  },
  image: {
    maxWidth: '30%',
    height: 'auto',
  },
  photoStyle: {
    borderRadius: '4px',
    height: '15em',
    width: '15em',
    cursor: 'pointer',
    transition: '0.3s ease-in-out',
    '&:hover': {
      filter: 'brightness(0.85)',
      boxShadow: '0 4px 4px rgba(0, 0, 0, 0.1)',
      transform: 'scale(1.02)',
    },
  },
  photoRowStyle: {
    overflowX: 'auto',
    overflowY: 'hidden',
    display: 'flex',
    flexDirection: 'row',
    gap: '1vw',
    paddingTop: '2%',
    paddingLeft: '0.6%',
    paddingRight: '0.6%',
    paddingBottom: '2%',
  },
}));

/**
 * Component Props for AdminCantFindApt.
 */
type Props = {
  /** The ID of the pending building report. */
  readonly pending_building_id: string;

  /** The date of the report. */
  readonly date: Date;

  /** The apartment name. */
  readonly apartmentName: string;

  /** The apartment address. */
  readonly apartmentAddress: string;

  /** The apartment photos. */
  readonly photos?: readonly string[];

  /** Function to trigger the photo carousel. */
  readonly triggerPhotoCarousel: (photos: readonly string[], startIndex: number) => void;

  /** Function to toggle the display. */
  readonly setToggle: React.Dispatch<React.SetStateAction<boolean>>;
};

/**
 * AdminCantFindApt - Displays apartment submission details from users who couldn't find their apartment in the system.
 *
 * @remarks
 * Renders a Material-UI Card containing details about an apartment that a user reported as missing from the system.
 * Includes the apartment name, address, submission date and any photos provided. Photos can be clicked to open in
 * a carousel viewer.
 *
 * @param {Date} props.date - The submission date/time of the apartment report
 * @param {string} props.apartmentName - The name of the apartment building/complex that was reported
 * @param {string} props.apartmentAddress - The street address of the reported apartment
 * @param {readonly string[]} props.photos - Optional array of photo URLs submitted with the report
 * @param {Function} props.triggerPhotoCarousel - Callback function to open the photo carousel viewer
 *
 * @returns {ReactElement} A Material-UI Card component displaying the apartment submission details
 */
const AdminCantFindApt = ({
  pending_building_id,
  date,
  apartmentName,
  apartmentAddress,
  photos = [],
  triggerPhotoCarousel,
  setToggle,
}: Props): ReactElement => {
  const { root, image, photoStyle, photoRowStyle } = useStyles();
  const formattedDate = new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });

  /**
   * Change the status of the pending building report and trigger a re-render.
   *
   * @param pending_building_id - The ID of the pending building report.
   * @param newStatus - The new status for the pending building report.
   * @returns A promise representing the completion of the operation.
   */
  const changeStatus = async (pending_building_id: string, newStatus: string) => {
    const endpoint = `/api/update-pending-building-status/${pending_building_id}/${newStatus}`;
    let user = await getUser(true);
    if (user) {
      const token = await user.getIdToken(true);
      await axios.put(endpoint, {}, createAuthHeaders(token));
      setToggle((cur) => !cur);
    }
  };

  return (
    <Card className={root} variant="outlined">
      <Box minHeight="150px">
        <CardContent>
          <Typography variant="h6">Apartment Name: {apartmentName}</Typography>
          <Typography variant="body1">Address: {apartmentAddress}</Typography>
          <Typography variant="body1">Filed Date: {formattedDate}</Typography>
          {photos.length > 0 && (
            <Grid container>
              <Grid item className={photoRowStyle}>
                {photos.map((photo, i) => {
                  return (
                    <CardMedia
                      component="img"
                      alt="Apt image"
                      image={photo}
                      title="Apt image"
                      className={photoStyle}
                      onClick={() => triggerPhotoCarousel(photos, i)}
                      loading="lazy"
                    />
                  );
                })}
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Box>

      <CardActions>
        <Grid container spacing={2} alignItems="center" justifyContent="flex-end">
          {
            <Grid item>
              <Button
                onClick={() => changeStatus(pending_building_id, 'DELETED')}
                variant="contained"
                style={{ color: colors.black }}
              >
                <strong>Delete</strong>
              </Button>
            </Grid>
          }
          {
            <Grid item>
              <Button
                onClick={() => changeStatus(pending_building_id, 'COMPLETED')}
                variant="outlined"
                style={{ backgroundColor: colors.green1 }}
              >
                <strong>Done</strong>
              </Button>
            </Grid>
          }
        </Grid>
      </CardActions>
    </Card>
  );
};

export default AdminCantFindApt;
