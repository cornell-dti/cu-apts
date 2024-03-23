import React, { ReactElement, useState, useEffect } from 'react';
import {
  CardHeader,
  CardMedia,
  Grid,
  Button,
  withStyles,
  makeStyles,
  Avatar,
  ButtonBase,
} from '@material-ui/core';
import styles from './Header.module.scss';
import { ApartmentWithId } from '../../../../common/types/db-types';
import defaultHeader from '../../assets/default_header.svg';
import { ReactComponent as DefaultIcon } from '../../assets/default_icon.svg';
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
    height: '352px',
    backgroundBlendMode: 'darken',
    position: 'relative',
  },
  overlayContainer: {
    position: 'relative',
    width: '100%',
  },
  mediaGradient: {
    height: '100%',
    background: 'linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent)',
    position: 'relative',
  },
  mobileMedia: {
    height: '200px',
    backgroundBlendMode: 'darken',
    position: 'relative',
    width: '108.7%',
    marginLeft: '-4.3%',
    resizeMode: 'contain',
  },
  headerInfoContainer: {
    bottom: 0,
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    minHeight: '40%',
  },
  mobileHeaderInfoContainer: {
    bottom: '0',
    position: 'absolute',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    height: 'auto',
    width: '100%',
    paddingTop: '10px',
    paddingBottom: '20px',
  },
  logo: {
    height: '86px',
    width: '86px',
    fontSize: '3rem',
    marginLeft: '20px',
  },
  mobileLogo: {
    height: '56px',
    width: '56px',
    fontSize: '3rem',
    marginRight: '15px',
    [theme.breakpoints.up('md')]: {
      marginLeft: '5%',
      marginBottom: '20px',
    },
  },
  aptName: {
    color: colors.white,
    paddingLeft: '20px',
    paddingBottom: 0,
    fontWeight: 'bold',
    fontSize: '36px',
    lineHeight: '43px',
    letterSpacing: '0.02em',
    marginTop: '10px',
  },
  aptAddress: {
    color: colors.white,
    paddingLeft: '20px',
    fontStyle: 'normal',
    fontSize: '20px',
    letterSpacing: '0.02em',
    marginBottom: '10px',
  },
  mobileAptName: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: '23px',
    lineHeight: '43px',
    letterSpacing: '0.02em',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    maxHeight: 'none', // Adjust based on your font size and desired number of lines
  },
  mobileAptAddress: {
    color: colors.white,
    fontStyle: 'normal',
    fontSize: '17px',
    letterSpacing: '0.02em',
    marginTop: '-5px',
  },
  headerSection: {
    bottom: 0,
    textAlign: 'left',
    [theme.breakpoints.down('sm')]: {
      marginLeft: '10px',
    },
  },
  mobileHeaderSection: {
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  btnSection: {
    height: '94%',
    [theme.breakpoints.down('sm')]: {
      height: '97%',
    },
  },
  logoGrid: {
    marginRight: '1em',
    flex: '0 0 auto',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  logoGridMobile: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
}));

const ApartmentHeader = ({ apartment, handleClick }: Props): ReactElement => {
  const { name, address, photos } = apartment;
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const photoLink = photos.length > 0 ? photos[0] : defaultHeader;

  const {
    media,
    overlayContainer,
    mediaGradient,
    mobileMedia,
    headerInfoContainer,
    mobileHeaderInfoContainer,
    logo,
    mobileLogo,
    aptName,
    aptAddress,
    headerSection,
    mobileHeaderSection,
    btnSection,
    logoGrid,
    logoGridMobile,
    mobileAptName,
    mobileAptAddress,
  } = useStyles();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const headerContent = (
    <Grid container className={!isMobile ? headerInfoContainer : mobileHeaderInfoContainer}>
      <Grid item xs={!isMobile ? 12 : 3} md={1} className={!isMobile ? logoGrid : logoGridMobile}>
        <DefaultIcon
          className={!isMobile ? logo : mobileLogo}
          aria-label={name}
          color={photos.length > 0 ? 'rgba(185, 70, 48, 0.8)' : 'rgb(185, 70, 48)'}
        />
      </Grid>
      <Grid item xs={!isMobile ? 6 : 9} className={!isMobile ? headerSection : mobileHeaderSection}>
        <CardHeader
          title={name}
          className={!isMobile ? aptName : mobileAptName}
          disableTypography={true}
        />
        <CardHeader
          title={address}
          className={!isMobile ? aptAddress : mobileAptAddress}
          disableTypography={true}
        />
      </Grid>
    </Grid>
  );

  return (
    <Grid container spacing={0} alignItems="flex-end" className={styles.HeaderDiv}>
      <>
        <GlobalCss />
        <Grid item xs={12}>
          <ButtonBase
            onClick={handleClick}
            style={{ width: '100%', display: 'block' }}
            disableRipple
            disabled={photos.length === 0}
          >
            <div className={!isMobile ? overlayContainer : ''}>
              <CardMedia className={!isMobile ? media : mobileMedia} image={photoLink}>
                <div className={photos.length > 0 ? mediaGradient : ''}>
                  {!isMobile ? (
                    <Grid item xs={12}>
                      {headerContent}
                    </Grid>
                  ) : (
                    headerContent
                  )}
                </div>
              </CardMedia>
            </div>
          </ButtonBase>
        </Grid>
      </>
    </Grid>
  );
};

export default ApartmentHeader;
