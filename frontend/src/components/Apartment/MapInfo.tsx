import React, { ReactElement, useRef } from 'react';
import { Box, Grid, IconButton, Typography, makeStyles } from '@material-ui/core';
import GoogleMapReact from 'google-map-react';
import aptIcon from '../../assets/location-pin.svg';
import schoolIcon from '../../assets/school-pin.svg';
import expandIcon from '../../assets/expand-button.svg';
import zoomInIcon from '../../assets/zoom-in-icon.png';
import zoomOutIcon from '../../assets/zoom-out-icon.png';
import recenterIcon from '../../assets/recenter-icon.svg';
import blackPinIcon from '../../assets/ph_map-pin-fill.svg';
import { config } from 'dotenv';
import { Marker } from './Marker';

config();

export type BaseProps = {
  readonly address: string | null;
  readonly latitude?: number;
  readonly longitude?: number;
  readonly walkTime?: number;
  readonly driveTime?: number;
};

type MapInfoProps = BaseProps & {
  handleClick: () => void;
  isMobile: boolean;
};

export type distanceProps = {
  location: string;
  walkDistance: number;
};

const WalkDistanceInfo = ({ location, walkDistance }: distanceProps) => {
  return (
    <div>
      <Grid
        container
        justifyContent="space-between"
        alignItems="center"
        style={{ marginTop: '5px' }}
      >
        <Grid item>
          <Grid container alignItems="center" spacing={1}>
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
          <Typography variant="h6" style={{ fontWeight: 400, fontSize: '16.964px' }}>
            {walkDistance} min walk
          </Typography>
        </Grid>
      </Grid>
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  outerMapDiv: {
    height: '331.046px',
    width: '100%',
    borderRadius: '10px',
    overflow: 'hidden',
    outline: 'none',
    position: 'relative',
  },
  innerMapDiv: {
    height: '380px',
    width: '110%',
    borderRadius: '10px',
    overflow: 'hidden',
    outline: 'none',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%,-50%)',
  },
  mapExpandButton: {
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

/**
 * `MapInfo` Component - Displays map and location information of an apartment.
 *
 * @remarks
 * This component is used in the ApartmentPage to display the map and location
 * information of each apartment, including its location on Google Map, address,
 * and time required for walking to campus from different Cornell landmarks.
 * It uses Material-UI components for consistent styling.
 *
 * @param Props - Contains:
 *   - `address`: The address of the apartment.
 *   - `latitude`: The latitude of the apartment location.
 *   - `longitude`: The longitude of the apartment location.
 *   - `walkTime`: The walk time from the apartment to campus landmarks.
 */
export default function MapInfo({
  address,
  latitude = 0,
  longitude = 0,
  walkTime = 0,
  handleClick,
  isMobile,
}: MapInfoProps): ReactElement {
  const { outerMapDiv, innerMapDiv, mapExpandButton, recenterButton, zoomInButton, zoomOutButton } =
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

  const expandOrRecenter = (isMobile: boolean) => {
    return isMobile ? (
      <IconButton disableRipple className={recenterButton} onClick={handleRecenter}>
        <img
          src={recenterIcon}
          alt={'recenter-icon'}
          style={{ width: '21.4px', height: '21.4px' }}
        />
      </IconButton>
    ) : (
      <IconButton onClick={handleClick} className={mapExpandButton} disableRipple>
        <img src={expandIcon} alt={'expand-icon'} style={{ width: '21.4px', height: '21.4px' }} />
      </IconButton>
    );
  };

  return (
    <Box border={1} borderColor="grey.300" borderRadius={10} mb={3}>
      <Box mx={3} my={3}>
        <div className={outerMapDiv}>
          <div className={innerMapDiv}>
            <GoogleMapReact
              onGoogleApiLoaded={handleApiLoaded}
              yesIWantToUseGoogleMapApiInternals
              bootstrapURLKeys={{ key: process.env.REACT_APP_MAPS_API_KEY || 'can not find api' }}
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
          {expandOrRecenter(isMobile)}
          {!isMobile && (
            <div>
              <IconButton onClick={handleClick} className={mapExpandButton} disableRipple>
                <img
                  src={expandIcon}
                  alt={'expand-icon'}
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
          )}
        </div>
        <Box>
          <Box my={1.5}>
            <Typography
              variant="h6"
              style={{ fontWeight: 600, fontSize: '17.588px', lineHeight: 'normal' }}
            >
              {address}
            </Typography>
          </Box>
          <Box
            style={{
              lineHeight: 'normal',
              letterSpacing: '0.38px',
            }}
          >
            <Typography variant="h6" style={{ fontWeight: 400, fontSize: '16.964px' }}>
              Distance from Campus
            </Typography>
            <WalkDistanceInfo location={'Engineering Quad'} walkDistance={walkTime} />
            <WalkDistanceInfo location={'Ho Plaza'} walkDistance={walkTime} />
            <WalkDistanceInfo location={'Ag Quad'} walkDistance={walkTime} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
