import React, { ReactElement } from 'react';
import { Card, CardContent, CardMedia, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { createAuthHeaders, getUser } from '../../utils/firebase';

const useStyles = makeStyles(() => ({
  root: {
    borderRadius: '10px',
  },
  cardContent: {
    border: '1px solid #e0e0e0',
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
  date,
  apartmentName,
  apartmentAddress,
  photos = [],
  triggerPhotoCarousel,
}: Props): ReactElement => {
  const { root, cardContent, image, photoStyle, photoRowStyle } = useStyles();
  const formattedDate = new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
  return (
    <Card className={root}>
      <CardContent className={cardContent}>
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
    </Card>
  );
};

export default AdminCantFindApt;
