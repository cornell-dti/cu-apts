import React, { ReactElement, useState, useEffect } from 'react';

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
  readonly handleClick: () => void;
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
  btnSection: {
    height: '94%',
    [theme.breakpoints.down('sm')]: {
      height: '97%',
    },
  },
  logoGrid: {
    marginRight: '1em',
  },
  mobileLogo: {
    height: '56px',
    width: '56px',
    fontSize: '3rem',
    marginTop: '120px',
    marginLeft: '10%',
    [theme.breakpoints.up('md')]: {
      marginLeft: '5%',
      marginBottom: '20px',
    },
  },
  mobileLandlordName: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: '23px',
    lineHeight: '43px',
    letterSpacing: '0.02em',
    marginTop: '115px',
    marginLeft: '-55%',
  },
  mobileMedia: {
    height: '200px',
    backgroundBlendMode: 'darken',
    position: 'relative',
    width: '108.7%',
    marginLeft: '-4.3%',
    resizeMode: 'contain',
  },
}));

const LandlordHeader = ({ landlord, handleClick }: Props): ReactElement => {
  const { name, profilePhoto, photos } = landlord;
  const icon = profilePhoto ? profilePhoto : defaultIcon;
  const photoLink = photos.length ? photos[0] : defaultHeader;
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const {
    media,
    logo,
    photoButton,
    landlordName,
    mobileLogo,
    mobileLandlordName,
    headerSection,
    btnSection,
    logoGrid,
    mobileMedia,
  } = useStyles();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const header = (
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
                </Grid>
              </Grid>
            </Grid>
            {photos.length > 0 && (
              <Grid
                container
                alignItems="flex-end"
                justifyContent="flex-end"
                className={btnSection}
              >
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

  const mobileHeader = (
    <Grid container spacing={0} alignItems="flex-end" className={styles.HeaderDiv}>
      <>
        <GlobalCss />
        <Grid item xs={12}>
          <CardMedia className={mobileMedia} image={photoLink}>
            <Grid container alignItems="center" className={headerSection}>
              <Grid item xs={6}>
                <Avatar src={icon} alt={name} className={mobileLogo} />
              </Grid>
              <Grid item xs={6}>
                <CardHeader title={name} className={mobileLandlordName} disableTypography={true} />
              </Grid>
            </Grid>
          </CardMedia>
        </Grid>
        {photos.length > 0 && (
          <Grid container alignItems="flex-end" justifyContent="flex-end" className={btnSection}>
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
      </>
    </Grid>
  );

  return isMobile ? mobileHeader : header;
};

export default LandlordHeader;
