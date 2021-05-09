import React, { ReactElement, useState } from 'react';
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
import { isMobile } from '../../utils/isMobile';
import { useEffect } from 'react';
import styles from './Header.module.scss';
import { Landlord } from '../../../../common/types/db-types';

const defaultPhotoLink =
  'https://apartments.naproperties.com/nap-cincinnati/wp-content/uploads/2016/06/random.jpg';

type View = {
  mobileView: boolean;
};

type Props = {
  readonly landlord: Landlord;
  readonly numReviews: number;
  handleClick: () => void;
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
    position: 'relative',
  },
  logo: {
    height: '86px',
    width: '86px',
    fontSize: '3rem',
  },
  photoButton: {
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
  landlordName: {
    color: 'white',
    paddingLeft: 0,
    paddingBottom: 0,
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontSize: '36px',
    lineHeight: '43px',
    letterSpacing: '0.02em',
  },
  landlordReviews: {
    color: 'white',
    fontStyle: 'normal',
    fontWeight: 600,
    fontSize: '24px',
    lineHeight: '31px',
    position: 'relative',
    marginBottom: '20px',
  },
  landlordRating: {
    '& div': {
      display: 'inline-block',
      marginTop: '2px',
    },
  },
});

const LandlordHeader = ({ landlord, numReviews, handleClick }: Props): ReactElement => {
  const { name, avgRating, profilePhoto, photos } = landlord;
  const photoLink = photos.length ? photos[0] : defaultPhotoLink;
  const [state, setState] = useState<View>({
    mobileView: false,
  });
  const { mobileView } = state;
  useEffect(() => {
    const setResponsiveness = () => {
      return isMobile()
        ? setState((prevState) => ({ ...prevState, mobileView: true }))
        : setState((prevState) => ({ ...prevState, mobileView: false }));
    };
    setResponsiveness();
    window.addEventListener('resize', () => setResponsiveness());
  }, []);
  const { media, logo, photoButton, landlordName, landlordReviews, landlordRating } = useStyles();
  return (
    <Grid container spacing={0}>
      <React.Fragment>
        <GlobalCss />
        <Grid item xs={12}>
          <CardMedia className={media} image={photoLink}>
            <Grid item xs={12}>
              <div className={styles.HeaderDiv}>
                <Grid
                  container
                  className={styles.HeaderRow}
                  justify="space-between"
                  alignItems="flex-end"
                >
                  <Grid container item xs={9} justify="flex-start">
                    <Grid item md={mobileView ? 12 : 2}>
                      <Avatar
                        src={profilePhoto}
                        alt={name}
                        className={logo}
                        style={
                          mobileView
                            ? { marginLeft: '5px', marginBottom: '10px' }
                            : { marginLeft: '5%', marginBottom: '20px' }
                        }
                      />
                    </Grid>
                    <Grid item style={mobileView ? { marginLeft: '10px' } : {}}>
                      <CardHeader title={name} className={landlordName} disableTypography={true} />
                      <Grid container style={{ paddingTop: '10px' }}>
                        <Grid
                          item
                          className={landlordRating}
                          xs={12}
                          md={mobileView ? 12 : 3}
                          style={{ paddingTop: '5px', marginRight: '45px' }}
                        >
                          <HeartRating value={avgRating} readOnly />
                        </Grid>
                        <Grid item xs={12} md={mobileView ? 12 : 6}>
                          <CardHeader
                            title={numReviews + ' Reviews'}
                            className={landlordReviews}
                            disableTypography={true}
                            style={mobileView ? { marginLeft: '0px' } : {}}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                  {!mobileView && (
                    <Grid item>
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
                </Grid>
              </div>
            </Grid>
            {mobileView && (
              <Grid container alignItems="flex-end" style={{ height: '97%' }} justify="flex-end">
                <Button
                  disableFocusRipple
                  variant="outlined"
                  className={photoButton}
                  style={{ marginRight: '5px' }}
                  onClick={handleClick}
                >
                  Show all photos
                </Button>
              </Grid>
            )}
          </CardMedia>
        </Grid>
      </React.Fragment>
    </Grid>
  );
};

export default LandlordHeader;
