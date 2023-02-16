import React, { ReactElement } from 'react';
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
  const icon = defaultIcon;
  const photoLink = defaultHeader;
  const { media, logo, photoButton, aptName, aptAddress, headerSection, btnSection, logoGrid } =
    useStyles();
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
                  <CardHeader title={name} className={aptName} disableTypography={true} />
                  {address !== name && (
                    <CardHeader title={address} className={aptAddress} disableTypography={true} />
                  )}
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

export default ApartmentHeader;
