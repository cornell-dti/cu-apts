import React, { ReactElement } from 'react';
import HeartRating from '../utils/HeartRating';
import {
  CardHeader,
  CardMedia,
  Grid,
  Button,
  withStyles,
  makeStyles,
  Avatar,
} from '@material-ui/core';
import styles from './Header.module.scss';
import { Landlord } from '../../../../common/types/db-types';
import defaultHeader from '../../assets/default_header.svg';
import defaultIcon from '../../assets/default_icon.png';
import { colors } from '../../colors';

type Props = {
  readonly landlord: Landlord;
  readonly numReviews: number;
  readonly handleClick: () => void;
  readonly averageRating: number;
};

const GlobalCss = withStyles({
  '@global': {
    '.MuiCardHeader-root': {
      padding: '0',
    },
  },
})(() => null);

const useStyles = makeStyles((theme) => ({
  media: {
    height: '400px',
    backgroundBlendMode: 'darken',
    position: 'relative',
  },
  logo: {
    height: '86px',
    width: '86px',
    fontSize: '3rem',
    marginLeft: '5px',
    marginBottom: '10px',
    [theme.breakpoints.up('md')]: {
      marginLeft: '5%',
      marginBottom: '20px',
    },
  },
  photoButton: {
    marginRight: '5px',
    height: '45px',
    width: '133px',
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontSize: '14px',
    lineHeight: '17px',
    textTransform: 'none',
    color: colors.black,
    background: 'rgba(255, 255, 255, 1.0)',
    border: '2px solid black',
    borderColor: colors.black,
    boxSizing: 'border-box',
    borderRadius: '8px',
    padding: '0px',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.8)',
    },
    '&:focus': {
      borderColor: 'black !important',
    },
    [theme.breakpoints.up('md')]: {
      marginRight: '25px',
    },
  },
  landlordName: {
    color: colors.white,
    paddingLeft: 0,
    paddingBottom: 0,
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontSize: '36px',
    lineHeight: '43px',
    letterSpacing: '0.02em',
  },
  landlordReviews: {
    color: colors.white,
    fontStyle: 'normal',
    fontWeight: 600,
    fontSize: '24px',
    lineHeight: '31px',
    position: 'relative',
    marginBottom: '20px',
    [theme.breakpoints.down('sm')]: {
      marginLeft: '0px',
    },
  },
  landlordRating: {
    paddingTop: '5px',
    marginRight: '45px',
    '& div': {
      display: 'inline-block',
      marginTop: '2px',
    },
  },
  headerSection: {
    [theme.breakpoints.down('sm')]: {
      marginLeft: '10px',
    },
  },
  ratingSection: { paddingTop: '10px' },
  btnSection: {
    height: '94%',
    [theme.breakpoints.down('sm')]: {
      height: '97%',
    },
  },
  logoGrid: {
    marginRight: '1em',
  },
}));

const LandlordHeader = ({
  landlord,
  numReviews,
  handleClick,
  averageRating,
}: Props): ReactElement => {
  const { name, profilePhoto, photos } = landlord;
  const icon = profilePhoto ? profilePhoto : defaultIcon;
  const photoLink = photos.length ? photos[0] : defaultHeader;
  const {
    media,
    logo,
    photoButton,
    landlordName,
    landlordReviews,
    landlordRating,
    headerSection,
    ratingSection,
    btnSection,
    logoGrid,
  } = useStyles();
  return (
    <Grid container spacing={0} alignItems="flex-end" className={styles.HeaderDiv}>
      <>
        <GlobalCss />
        <Grid item xs={12}>
          <CardMedia className={media} image={photoLink}>
            <Grid item xs={12}>
              <Grid container className={styles.HeaderRow}>
                <Grid item xs={12} md={1} className={logoGrid}>
                  <Avatar src={icon} alt={name} className={logo} />
                </Grid>
                <Grid className={headerSection}>
                  <CardHeader title={name} className={landlordName} disableTypography={true} />
                  <Grid container className={ratingSection}>
                    <Grid item className={landlordRating} xs={12}>
                      <HeartRating value={averageRating} precision={0.5} readOnly />
                    </Grid>
                    <Grid item xs={12}>
                      <CardHeader
                        title={numReviews + (numReviews > 1 ? ' Reviews' : ' Review')}
                        className={landlordReviews}
                        disableTypography={true}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            {photos.length > 0 && (
              <Grid container alignItems="flex-end" justify="flex-end" className={btnSection}>
                <Button
                  disableFocusRipple
                  variant="outlined"
                  className={photoButton}
                  onClick={handleClick}
                >
                  Show all photos
                </Button>
              </Grid>
            )}
          </CardMedia>
        </Grid>
      </>
    </Grid>
  );
};

export default LandlordHeader;
