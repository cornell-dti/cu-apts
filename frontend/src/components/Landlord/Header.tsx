import React, { ReactElement } from 'react';
import HeartRating from '../utils/HeartRating';
import ApartmentPhoto1 from '../../assets/apartment_exterior.png';
import ApartmentPhoto2 from '../../assets/apartment_interior.png';
import Logo from '../../assets/company_logo.png';
import { CardHeader, CardMedia, Grid, Button, withStyles, makeStyles } from '@material-ui/core';
type Props = {
  readonly landlord: string;
  readonly overallRating: number;
  readonly numReviews: number;
};

const GlobalCss = withStyles({
  '@global': {
    '.MuiCardHeader-root': {
      padding: '0',
    },
  },
})(() => null);

const useStyles = makeStyles({
  media: {
    height: '400px',
    backgroundColor: 'rgba(0,0,0,0.6)',
    backgroundBlendMode: 'darken',
  },
  logo: {
    height: '86px',
    width: '86px',
    marginTop: '20%',
    marginLeft: '5%',
    borderRadius: '50%',
  },
  photobutton: {
    marginRight: '25px',
    height: '45px',
    width: '133px',
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontSize: '14px',
    lineHeight: '17px',
    textTransform: 'none',
    color: '#000000',
    background: 'rgba(255, 255, 255, 1.0)',
    border: '2px solid black',
    borderColor: 'black',
    boxSizing: 'border-box',
    borderRadius: '8px',
    padding: '0px',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.8)',
    },
    '&:focus': {
      borderColor: 'black !important',
    },
  },
  landlord_name: {
    color: 'white',
    paddingLeft: 0,
    paddingBottom: 0,
    paddingTop: '20px',
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontSize: '36px',
    lineHeight: '43px',
    letterSpacing: '0.02em',
  },
  landlord_reviews: {
    color: 'white',
    fontStyle: 'normal',
    fontWeight: 600,
    fontSize: '24px',
    lineHeight: '31px',
    marginLeft: '10px',
    position: 'relative',
    marginBottom: 0,
  },
  landlord_rating: {
    '& div': {
      display: 'inline-block',
      marginTop: '2px',
    },
  },
});

const LandlordHeader = ({ landlord, overallRating, numReviews }: Props): ReactElement => {
  const classes = useStyles();
  return (
    <Grid container spacing={0}>
      <React.Fragment>
        <GlobalCss />
        <Grid item xs={6}>
          <CardMedia className={classes.media} image={ApartmentPhoto1}>
            <Grid container xs={12} direction="row" alignItems="flex-end" style={{ height: '95%' }}>
              <Grid container spacing={0} direction="row" xs={2}>
                <CardMedia image={Logo} className={classes.logo} />
              </Grid>
              <Grid container spacing={0} direction="row" xs={10} style={{ height: '25%' }}>
                <CardHeader
                  title={landlord}
                  className={classes.landlord_name}
                  disableTypography={true}
                />
                <Grid container spacing={0} direction="row" xs={12} style={{ paddingTop: '10px' }}>
                  <Grid className={classes.landlord_rating}>
                    <HeartRating value={overallRating} readOnly />
                  </Grid>
                  <CardHeader
                    title={numReviews + ' Reviews'}
                    className={classes.landlord_reviews}
                    disableTypography={true}
                  />
                </Grid>
              </Grid>
            </Grid>
          </CardMedia>
        </Grid>
        <Grid item xs={6}>
          <CardMedia image={ApartmentPhoto2} className={classes.media}>
            <Grid container alignItems="flex-end" style={{ height: '97%' }} justify="flex-end">
              <Button disableFocusRipple variant="outlined" className={classes.photobutton}>
                Show all photos
              </Button>
            </Grid>
          </CardMedia>
        </Grid>
      </React.Fragment>
    </Grid>
  );
};

export default LandlordHeader;
