import React, { ReactElement } from 'react';
import { Card, CardContent, Grid, Typography } from '@material-ui/core';
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
};

const AdminCantFindApt = ({
  date,
  apartmentName,
  apartmentAddress,
  photos = [],
}: Props): ReactElement => {
  const classes = useStyles();
  const formattedDate = new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
  return (
    <Card className={classes.root}>
      <CardContent className={classes.cardContent}>
        <Typography variant="h6">Apartment Name: {apartmentName}</Typography>
        <Typography variant="body1">Address: {apartmentAddress}</Typography>
        <Typography variant="body1">Filed Date: {formattedDate}</Typography>
        <Grid container spacing={2}>
          {photos.map((photo) => (
            <Grid item xs={6} key={photo}>
              <img src={photo} alt="Apartment" className={classes.image} />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default AdminCantFindApt;
