// eslint-disable-next-line no-use-before-define
import React from 'react';
import { Card, CardMedia, Grid, Typography, makeStyles, Button } from '@material-ui/core';

export interface PropertyCardProps {
  propertyName: string;
  address: string;
  priceRange: string;
  bedrooms: string;
  imageUrl: string;
}

const useStyles = makeStyles({
  root: {
    borderRadius: '10px',
  },
  contentContainer: {
    padding: '1.5rem',
  },
  propertyName: {
    fontWeight: 800,
    fontSize: '29px',
    lineHeight: '36px',
  },
  addressText: {
    fontSize: '20px',
    fontWeight: 400,
    lineHeight: '32px',
  },
  detailText: {
    fontSize: '18px',
    fontWeight: 700,
  },
  iconContainer: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    border: '2px solid #000000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '8px',
  },
  icon: {
    fontSize: '16px',
    fontWeight: 'bold',
  },
});

/**
 * PropertyCard Component
 *
 * This component displays a card containing information about a specific property,
 * including its name, address, price range, number of bedrooms, and an image.
 * The card is responsive and adjusts its layout based on the screen size.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {ApartmentWithId} props.buildingData - The data for the apartment.
 * @param {number} props.numReviews - The number of reviews for the apartment.
 * @param {string} [props.company] - The company associated with the apartment (optional).
 * @returns {ReactElement} ApartmentCard component.
 */
const PropertyCard: React.FC<PropertyCardProps> = ({
  propertyName,
  address,
  priceRange,
  bedrooms,
  imageUrl,
}) => {
  const classes = useStyles();

  return (
    <Card className={classes.root} variant="outlined">
      <Grid container direction="row" spacing={2}>
        {/* Image Section */}
        <Grid item xs={12} md={3}>
          <CardMedia
            image={imageUrl}
            component="img"
            title={propertyName}
            style={{
              aspectRatio: '1',
              objectFit: 'cover',
              objectPosition: 'center',
              borderRadius: '6px',
            }}
          />
        </Grid>

        {/* Content Section */}
        <Grid item xs={12} md={9} container direction="column">
          {/* Property Name and Address */}
          <Grid item>
            <Typography variant="h5" className={classes.propertyName}>
              {propertyName}
            </Typography>
            <Typography className={classes.addressText}>{address}</Typography>
          </Grid>

          {/* Property Details */}
          <Grid
            item
            container
            direction="row"
            spacing={3}
            alignItems="center"
            style={{ marginTop: '16px' }}
          >
            {/* Price Range */}
            <Grid item>
              <Grid container alignItems="center">
                <div className={classes.iconContainer}>
                  <img src="backend/scripts/email/assets/moneyicon.svg" alt="" />
                </div>
                <Typography className={classes.detailText}>{priceRange}</Typography>
              </Grid>
            </Grid>

            {/* Bedrooms */}
            <Grid item>
              <Grid container alignItems="center">
                <div className={classes.iconContainer}>
                  <img src="backend/scripts/email/assets/ion_bed-outline.svg" alt="" />
                </div>
                <Typography className={classes.detailText}>{bedrooms}</Typography>
              </Grid>
            </Grid>

            {/* View Details Button - Optional */}
            <Grid item>
              <Button
                variant="outlined"
                color="primary"
                style={{ textTransform: 'none', fontWeight: 600 }}
              >
                View Details
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Card>
  );
};

export default PropertyCard;
