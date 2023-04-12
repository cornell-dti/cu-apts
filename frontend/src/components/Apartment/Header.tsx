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
import { ApartmentWithId } from '../../../../common/types/db-types';
import defaultHeader from '../../assets/default_header.svg';
import defaultIcon from '../../assets/default_icon.png';
import { colors } from '../../colors';

type Props = {
  readonly apartment: ApartmentWithId;
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
  mobileMedia: {
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
  mobileLogo: {
    height: '56px',
    width: '56px',
    fontSize: '3rem',
    marginBottom: '-50px',
    marginLeft: '8%',
    [theme.breakpoints.up('md')]: {
      marginLeft: '5%',
      marginBottom: '20px',
    },
  },
  photoButton: {
    marginRight: '5px',
    height: '45px',
    width: '133px',
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
  aptName: {
    color: colors.white,
    paddingLeft: 0,
    paddingBottom: 0,
    fontWeight: 'bold',
    fontSize: '36px',
    lineHeight: '43px',
    letterSpacing: '0.02em',
    marginTop: '10px',
  },
  aptAddress: {
    color: colors.white,
    fontStyle: 'normal',
    fontSize: '20px',
    letterSpacing: '0.02em',
  },
  mobileAptName: {
    color: colors.white,
    paddingLeft: 0,
    paddingBottom: 0,
    fontWeight: 'bold',
    fontSize: '23px',
    lineHeight: '43px',
    letterSpacing: '0.02em',
    marginTop: '10px',
    marginLeft: '2%',
  },
  mobileAptAddress: {
    color: colors.white,
    fontStyle: 'normal',
    fontSize: '17px',
    letterSpacing: '0.02em',
    marginLeft: '24.2%',
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
}));

const ApartmentHeader = ({ apartment, handleClick }: Props): ReactElement => {
  const { name, address, photos } = apartment;
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const icon = defaultIcon;
  const photoLink = defaultHeader;

  const {
    media,
    mobileMedia,
    logo,
    mobileLogo,
    photoButton,
    aptName,
    aptAddress,
    headerSection,
    btnSection,
    logoGrid,
    mobileAptName,
    mobileAptAddress,
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
                  <CardHeader title={name} className={aptName} disableTypography={true} />
                  <CardHeader title={address} className={aptAddress} disableTypography={true} />
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
          <CardMedia
            className={mobileMedia}
            image={photoLink}
            style={{ height: '203px', width: '115%', marginLeft: '-10%' }}
          >
            <Grid alignItems="center" className={headerSection}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <Avatar
                  src={icon}
                  alt={name}
                  className={mobileLogo}
                  style={{ marginTop: '100px' }}
                />
                <CardHeader
                  title={name}
                  className={mobileAptName}
                  disableTypography={true}
                  style={{ marginTop: '120px' }}
                />
                <CardHeader
                  title={address}
                  className={mobileAptAddress}
                  disableTypography={true}
                  style={{ marginTop: '-8px' }}
                />
              </div>
            </Grid>
          </CardMedia>
        </Grid>
      </>
    </Grid>
  );

  return isMobile ? mobileHeader : header;
};

export default ApartmentHeader;
