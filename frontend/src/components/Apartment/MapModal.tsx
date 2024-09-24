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
import React, { Dispatch, SetStateAction, useRef } from 'react';
import { BaseProps, distanceProps } from './MapInfo';

const useStyles = makeStyles((theme) => ({
  paper: {
    borderRadius: '13.895px',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  outerMapDiv: {
    height: '450px',
    width: '100%',
    borderRadius: '12.764px',
    overflow: 'hidden',
    outline: 'none',
    position: 'relative',
  },
  innerMapDiv: {
    height: '500px',
    width: '100%',
    borderRadius: '12.764px',
    overflow: 'hidden',
    outline: 'none',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%,-50%)',
  },
  recenterButton: {
    position: 'absolute',
    top: '13px',
    right: '13px',
    padding: '9px',
    width: '39px',
    height: '39px',
    borderRadius: '4px',
    background: 'rgba(255, 255, 255, 0.70)',
    boxShadow: '2px 4px 4px 0px rgba(0, 0, 0, 0.10)',
  },
  zoomInButton: {
    position: 'absolute',
    bottom: '53px',
    right: '13px',
    width: '39px',
    height: '39px',
    borderRadius: '4px',
    background: 'rgba(255, 255, 255, 0.70)',
    boxShadow: '2px 4px 4px 0px rgba(0, 0, 0, 0.10)',
  },
  zoomOutButton: {
    position: 'absolute',
    bottom: '13px',
    right: '13px',
    width: '39px',
    height: '39px',
    borderRadius: '4px',
    background: 'rgba(255, 255, 255, 0.70)',
    boxShadow: '2px 4px 4px 0px rgba(0, 0, 0, 0.10)',
  },
}));

interface MapModalProps extends BaseProps {
  aptName: string;
  open: boolean;
  onClose: () => void;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

/**
 * `MapModal` Component - Displays map and location information of an apartment
 * as a modal when user expand the default map.
 *
 * @remarks
 * This component is used in the ApartmentPage to display the expanded map and
 * location information of each apartment, including its location on Google Map,
 * address, and time required for walking/driving to Cornell landmarks on campus.
 * It uses Material-UI components for consistent styling.
 *
 * @param Props - Contains:
 *   - `address`: The address of the apartment.
 *   - `latitude`: The latitude of the apartment location.
 *   - `longitude`: The longitude of the apartment location.
 *   - `walkTime`: The walk time from the apartment to Cornell ladmarks.
 *   - `driveTime`: The drive time from the apartment to Cornell ladmarks.
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
  const { paper, outerMapDiv, innerMapDiv, recenterButton, zoomInButton, zoomOutButton } =
    useStyles();
  const mapRef = useRef<google.maps.Map | null>(null);

  const handleApiLoaded = ({ map, maps }: { map: google.maps.Map; maps: typeof google.maps }) => {
    mapRef.current = map;
  };

  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.setCenter({ lat: latitude, lng: longitude });
      mapRef.current.setZoom(16);
    }
  };

  // Function to handle zoom in/out of the map
  const handleZoom = (zoomChange: number) => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom() || 16; // Ensure there is a valid value for currentZoom
      const newZoom = currentZoom + zoomChange;
      if (newZoom > 11 && newZoom < 20) {
        // Ensure the new zoom is within the allowed range
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
  }) => {
    return (
      <Grid container alignItems="center" spacing={1}>
        <Grid item>
          <img src={icon} alt={altText} />
        </Grid>
        <Grid item>
          <Typography variant="h6" style={{ fontWeight: 400, fontSize: '16.964px' }}>
            {distance} min
          </Typography>
        </Grid>
      </Grid>
    );
  };

  const DistanceInfo = ({
    location,
    walkDistance,
    driveDistance,
  }: distanceProps & { driveDistance: number }) => {
    return (
      <Grid
        container
        justifyContent="space-between"
        alignItems="flex-start"
        style={{ width: '100%', height: '30px' }}
      >
        <Grid item>
          <Grid container alignItems="center" spacing={1} style={{ width: '200px' }}>
            <Grid item>
              <img src={blackPinIcon} alt={'black-pin-icon'} />
            </Grid>
            <Grid item>
              <Typography variant="h6" style={{ fontWeight: 400, fontSize: '16.964px' }}>
                {location}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <IconAndText icon={walkIcon} altText={'walk-icon'} distance={walkDistance} />
        </Grid>
        <Grid item>
          <IconAndText icon={driveIcon} altText={'drive-icon'} distance={driveDistance} />
        </Grid>
      </Grid>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        className: paper,
      }}
      maxWidth="sm"
    >
      <Box style={{ margin: '33px', width: '933px', height: '800px', padding: '0px' }}>
        <DialogTitle style={{ padding: 0, margin: 0, height: '30px' }}>
          <Grid
            container
            justifyContent="space-between"
            alignItems="flex-start"
            style={{ height: '30px' }}
          >
            <Grid item>
              <Typography
                variant="h6"
                style={{ fontWeight: 600, fontSize: '23px', lineHeight: '30px' }}
              >
                {aptName}
              </Typography>
            </Grid>
            <Grid item>
              <DialogActions style={{ padding: 0, margin: 0 }}>
                <IconButton
                  onClick={() => setOpen(false)}
                  disableRipple
                  style={{ height: '30px', padding: 0, margin: 0 }}
                >
                  <img
                    src={closeMapIcon}
                    alt={'close-icon'}
                    style={{ width: '26.9px', height: '26.9px' }}
                  />
                </IconButton>
              </DialogActions>
            </Grid>
          </Grid>
        </DialogTitle>

        <DialogContent style={{ padding: 0, marginTop: '22.23px', overflow: 'hidden' }}>
          <Box style={{ width: '934px', height: '600px', padding: 0, margin: 0 }}>
            <div className={outerMapDiv}>
              <div className={innerMapDiv}>
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
              <IconButton disableRipple className={recenterButton} onClick={handleRecenter}>
                <img
                  src={recenterIcon}
                  alt={'recenter-icon'}
                  style={{ width: '21.4px', height: '21.4px' }}
                />
              </IconButton>
              <IconButton disableRipple className={zoomInButton} onClick={() => handleZoom(1)}>
                <img
                  src={zoomInIcon}
                  alt={'zoom-in-icon'}
                  style={{ width: '21.4px', height: '21.4px' }}
                />
              </IconButton>
              <IconButton disableRipple className={zoomOutButton} onClick={() => handleZoom(-1)}>
                <img
                  src={zoomOutIcon}
                  alt={'zoom-out-icon'}
                  style={{ width: '21.4px', height: '21.4px' }}
                />
              </IconButton>
            </div>

            <Grid
              container
              justifyContent="space-between"
              alignItems="flex-start"
              style={{ marginTop: '22.3px', marginBottom: '0px' }}
            >
              <Grid item>
                <Typography variant="h6" style={{ fontWeight: 600, fontSize: '20px' }}>
                  {address}
                </Typography>
              </Grid>
              <Grid item style={{ width: '45%' }}>
                <Grid
                  container
                  direction="column"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  style={{ paddingTop: '0px' }}
                >
                  <Typography
                    variant="h6"
                    style={{
                      fontWeight: 600,
                      fontSize: '18px',
                      lineHeight: '28px',
                      marginBottom: '10px',
                    }}
                  >
                    Distance from Campus
                  </Typography>
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
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
      </Box>
    </Dialog>
  );
};

export default MapModal;
