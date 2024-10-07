import React, { Dispatch, SetStateAction, useRef, useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  makeStyles,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@material-ui/core';
import GoogleMapReact from 'google-map-react';
import walkIcon from '../../assets/walk-icon.svg';
import driveIcon from '../../assets/drive-icon.svg';
import aptIcon from '../../assets/location-pin.svg';
import schoolIcon from '../../assets/school-pin.svg';
import recenterIcon from '../../assets/recenter-icon.svg';
import closeMapIcon from '../../assets/close-map-icon.svg';
import zoomInIcon from '../../assets/zoom-in-icon.png';
import zoomOutIcon from '../../assets/zoom-out-icon.png';
import { Marker } from './Marker';
import blackPinIcon from '../../assets/ph_map-pin-fill.svg';
import { BaseProps, distanceProps } from './MapInfo';

const useStyles = makeStyles((theme) => ({
  paper: {
    borderRadius: '13.895px',
    maxWidth: '70%',
    maxHeight: '94%',
    overflow: 'hidden',
  },
  outerMapDiv: {
    height: '50vh',
    width: '94%',
    borderRadius: '12.764px',
    overflow: 'hidden',
    outline: 'none',
    position: 'relative',
    marginBottom: '30px',
  },
  innerMapDiv: {
    height: '130%',
    width: '100%',
    borderRadius: '12.764px',
    overflow: 'hidden',
    outline: 'none',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%,-50%)',
  },
  mapButton: {
    position: 'absolute',
    padding: '9px',
    width: '39px',
    height: '39px',
    borderRadius: '4px',
    background: 'rgba(255, 255, 255, 0.70)',
    boxShadow: '2px 4px 4px 0px rgba(0, 0, 0, 0.10)',
  },
  contentBox: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    overflow: 'auto',
    alignItems: 'center',
    marginBottom: '30px',
  },
  addressTypography: {
    fontWeight: 600,
    fontSize: 'clamp(16px, 4vw, 20px)',
    marginBottom: '16px',
  },
  distanceTypography: {
    fontWeight: 600,
    fontSize: 'clamp(14px, 3.5vw, 18px)',
    lineHeight: '28px',
    marginBottom: '10px',
  },
}));

interface MapModalProps extends BaseProps {
  aptName: string;
  open: boolean;
  onClose: () => void;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

/**
 * `MapModal` Component - Displays a modal with detailed map and location information of an apartment.
 *
 * @remarks
 * This component is used to show an expanded view of the apartment's location on Google Maps,
 * along with detailed information about the apartment's address and distances to various
 * campus landmarks. It provides interactive features such as zooming and recentering the map.
 * The component uses Material-UI for styling and is responsive to different screen sizes.
 *
 * @param Props - Contains:
 *   - `aptName`: The name of the apartment.
 *   - `open`: Boolean to control the visibility of the modal.
 *   - `onClose`: Function to handle closing the modal.
 *   - `setOpen`: Function to set the open state of the modal.
 *   - `address`: The address of the apartment.
 *   - `latitude`: The latitude of the apartment location (default: 0).
 *   - `longitude`: The longitude of the apartment location (default: 0).
 *   - `walkTime`: The walk time from the apartment to campus landmarks (default: 0).
 *   - `driveTime`: The drive time from the apartment to campus landmarks (default: 0).
 */
const MapModal = ({
  aptName,
  open,
  onClose,
  setOpen,
  address,
  latitude = 0,
  longitude = 0,
  walkTime = 0,
  driveTime = 0,
}: MapModalProps) => {
  const classes = useStyles();
  const theme = useTheme();
  const mapRef = useRef<google.maps.Map | null>(null);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.up('lg'));

  const handleApiLoaded = ({ map, maps }: { map: google.maps.Map; maps: typeof google.maps }) => {
    mapRef.current = map;
  };

  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.setCenter({ lat: latitude, lng: longitude });
      mapRef.current.setZoom(16);
    }
  };

  const handleZoom = (zoomChange: number) => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom() || 16;
      const newZoom = currentZoom + zoomChange;
      if (newZoom > 11 && newZoom < 20) {
        mapRef.current.setZoom(newZoom);
      }
    }
  };

  const IconAndText = ({
    icon,
    altText,
    distance,
  }: {
    icon: string;
    altText: string;
    distance: number;
  }) => (
    <Grid container alignItems="center" spacing={1}>
      <Grid item>
        <img src={icon} alt={altText} style={{ width: 'clamp(16px, 4vw, 24px)', height: 'auto' }} />
      </Grid>
      <Grid item>
        <Typography variant="body2" style={{ fontSize: 'clamp(12px, 3vw, 16px)' }}>
          {distance} min
        </Typography>
      </Grid>
    </Grid>
  );

  const DistanceInfo = ({
    location,
    walkDistance,
    driveDistance,
  }: distanceProps & { driveDistance: number }) => (
    <Grid
      container
      justifyContent="space-between"
      alignItems="center"
      style={{ marginBottom: '8px' }}
    >
      <Grid item xs={6}>
        <Grid container alignItems="center" spacing={1}>
          <Grid item>
            <img
              src={blackPinIcon}
              alt={'black-pin-icon'}
              style={{ width: 'clamp(10px, 4vw, 24px)', height: 'auto' }}
            />
          </Grid>
          <Grid item>
            <Typography variant="body2" style={{ fontSize: 'clamp(10px, 3vw, 16px)' }}>
              {location}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={3}>
        <IconAndText icon={walkIcon} altText={'walk-icon'} distance={walkDistance} />
      </Grid>
      <Grid item xs={3}>
        <IconAndText icon={driveIcon} altText={'drive-icon'} distance={driveDistance} />
      </Grid>
    </Grid>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        className: classes.paper,
      }}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle style={{ padding: '16px' }}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item style={{ paddingLeft: '15px', paddingTop: '20px' }}>
            <Typography
              variant="h6"
              style={{ fontWeight: 600, fontSize: 'clamp(18px, 5vw, 23px)' }}
            >
              {aptName}
            </Typography>
          </Grid>
          <Grid item>
            <IconButton onClick={() => setOpen(false)} style={{ padding: 0 }}>
              <img
                src={closeMapIcon}
                alt={'close-icon'}
                style={{ width: 'clamp(20px, 5vw, 26.9px)', height: 'auto' }}
              />
            </IconButton>
          </Grid>
        </Grid>
      </DialogTitle>

      <DialogContent style={{ padding: 0, overflow: 'hidden' }}>
        <Box className={classes.contentBox}>
          <div className={classes.outerMapDiv}>
            <div className={classes.innerMapDiv}>
              <GoogleMapReact
                bootstrapURLKeys={{
                  key: process.env.REACT_APP_MAPS_API_KEY || 'can not find api',
                }}
                onGoogleApiLoaded={handleApiLoaded}
                yesIWantToUseGoogleMapApiInternals
                defaultCenter={{ lat: latitude, lng: longitude }}
                defaultZoom={16}
                options={{
                  fullscreenControl: false,
                  zoomControl: false,
                }}
              >
                <Marker lat={latitude} lng={longitude} src={aptIcon} altText="apartment icon" />
                <Marker
                  lat={42.44455308325643}
                  lng={-76.48360496778704}
                  src={schoolIcon}
                  altText="Engineering Quad icon"
                />
                <Marker
                  lat={42.449014547431425}
                  lng={-76.48413980587392}
                  src={schoolIcon}
                  altText="Arts Quad icon"
                />
                <Marker
                  lat={42.446768276610875}
                  lng={-76.48505175766948}
                  src={schoolIcon}
                  altText="Ho Plaza icon"
                />
                <Marker
                  lat={42.448929851009716}
                  lng={-76.47804712490351}
                  src={schoolIcon}
                  altText="Ag Quad icon"
                />
              </GoogleMapReact>
            </div>
            <IconButton
              className={`${classes.mapButton}`}
              style={{ top: '13px', right: '13px' }}
              onClick={handleRecenter}
            >
              <img
                src={recenterIcon}
                alt={'recenter-icon'}
                style={{ width: '100%', height: 'auto' }}
              />
            </IconButton>
            <IconButton
              className={`${classes.mapButton}`}
              style={{ bottom: '53px', right: '13px' }}
              onClick={() => handleZoom(1)}
            >
              <img
                src={zoomInIcon}
                alt={'zoom-in-icon'}
                style={{ width: '100%', height: 'auto' }}
              />
            </IconButton>
            <IconButton
              className={`${classes.mapButton}`}
              style={{ bottom: '13px', right: '13px' }}
              onClick={() => handleZoom(-1)}
            >
              <img
                src={zoomOutIcon}
                alt={'zoom-out-icon'}
                style={{ width: '100%', height: 'auto' }}
              />
            </IconButton>
          </div>

          <Box
            p={2}
            style={{ width: '94%', padding: 0, display: 'flex', justifyContent: 'space-between' }}
          >
            <Typography className={classes.addressTypography}>
              {!isSmallScreen && address}
            </Typography>

            {isMediumScreen && (
              <Box style={{ minWidth: '50%' }}>
                <Typography className={classes.distanceTypography}>Distance from Campus</Typography>
                <DistanceInfo
                  location={'Engineering Quad'}
                  walkDistance={walkTime}
                  driveDistance={driveTime}
                />
                <DistanceInfo
                  location={'Ho Plaza'}
                  walkDistance={walkTime}
                  driveDistance={driveTime}
                />
                <DistanceInfo
                  location={'Ag Quad'}
                  walkDistance={walkTime}
                  driveDistance={driveTime}
                />
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default MapModal;
