import React, { ReactElement, useRef, useEffect, useState } from 'react';
import { Box, Grid, IconButton, Typography, makeStyles } from '@material-ui/core';
import GoogleMapReact from 'google-map-react';
import aptIcon from '../../assets/location-pin.svg';
import schoolIcon from '../../assets/school-pin.svg';
import expandIcon from '../../assets/expand-button.svg';
import zoomInIcon from '../../assets/zoom-in-icon.png';
import zoomOutIcon from '../../assets/zoom-out-icon.png';
import blackPinIcon from '../../assets/ph_map-pin-fill.svg';
import { config } from 'dotenv';
import { Marker } from './Marker';
import { LocationTravelTimes } from '../../../../common/types/db-types';

config();

export type BaseProps = {
  readonly address: string | null;
  readonly latitude?: number;
  readonly longitude?: number;
  readonly travelTimes?: LocationTravelTimes;
  isMobile: boolean;
};

type MapInfoProps = BaseProps & {
  handleClick: () => void;
  mapToggle: boolean;
};

export type distanceProps = {
  location: string;
  walkDistance: number | undefined;
};

/**
 * WalkDistanceInfo – Displays walking distance to a campus location.
 *
 * @param {string} props.location – The name of the campus location.
 * @param {number | undefined} props.walkDistance – Walking time in minutes.
 *
 * @return {JSX.Element} – A row showing the location and walk time.
 */
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
 * MapInfo – Displays map and location information of an apartment.
 *
 * @remarks
 * This component renders an interactive Google Map alongside walking distances
 * to key Cornell landmarks (Engineering Quad, Ho Plaza, Ag Quad). It supports
 * zoom controls, map re-centering, and an expand button for a fullscreen view.
 *
 * @param {string | null} props.address – The address of the apartment.
 * @param {number} props.latitude – The latitude of the apartment location.
 * @param {number} props.longitude – The longitude of the apartment location.
 * @param {LocationTravelTimes} props.travelTimes – Walking times from the apartment to campus landmarks.
 * @param {() => void} props.handleClick – Handler for the expand button to show a fullscreen map view.
 * @param {boolean} props.mapToggle – Toggle used by the parent to reset map zoom and center.
 * @param {boolean} props.isMobile – Whether the component is being viewed on a mobile device.
 *
 * @return {ReactElement} – The rendered MapInfo component.
 */
function MapInfo({
  address,
  latitude = 0,
  longitude = 0,
  travelTimes,
  handleClick,
  mapToggle,
  isMobile,
}: MapInfoProps): ReactElement {
  const { outerMapDiv, innerMapDiv, mapExpandButton, zoomInButton, zoomOutButton } = useStyles();
  const mapRef = useRef<google.maps.Map | null>(null);

  const defaultZoom = isMobile ? 15 : 16;
  const defaultMarkerSize = isMobile ? 24 : 60;
  const [markerSize, setMarkerSize] = useState(defaultMarkerSize);

  const handleApiLoaded = ({ map, maps }: { map: google.maps.Map; maps: typeof google.maps }) => {
    mapRef.current = map;
  };

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setCenter({ lat: latitude, lng: longitude });
      mapRef.current.setZoom(defaultZoom);
      setMarkerSize(defaultMarkerSize);
    }
  }, [mapToggle, latitude, longitude]);

  const handleZoom = (zoomChange: number) => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom() || 16;
      const newZoom = currentZoom + zoomChange;
      if (newZoom > 11 && newZoom < 20) {
        mapRef.current.setZoom(newZoom);
        setMarkerSize(markerSize + zoomChange * 2);
      }
    }
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
              defaultZoom={defaultZoom}
              options={{
                disableDefaultUI: true,
                // fullscreenControl: false,
                // zoomControl: false,
                // clickableIcons: false,
                styles: [
                  {
                    featureType: 'poi',
                    elementType: 'labels',
                    stylers: [{ visibility: 'on' }],
                  },
                ],
              }}
            >
              <Marker
                lat={latitude}
                lng={longitude}
                src={aptIcon}
                altText="apartment icon"
                size={markerSize}
              />

              <Marker
                lat={42.44455308325643}
                lng={-76.48360496778704}
                src={schoolIcon}
                altText="Engineering Quad icon"
                size={markerSize}
              />
              <Marker
                lat={42.446768276610875}
                lng={-76.48505175766948}
                src={schoolIcon}
                altText="Ho Plaza icon"
                size={markerSize}
              />
              <Marker
                lat={42.448929851009716}
                lng={-76.47804712490351}
                src={schoolIcon}
                altText="Ag Quad icon"
                size={markerSize}
              />
            </GoogleMapReact>
          </div>
          <IconButton onClick={handleClick} className={mapExpandButton} disableRipple>
            <img
              src={expandIcon}
              alt={'expand-icon'}
              style={{ width: '21.4px', height: '21.4px' }}
            />
          </IconButton>
          {
            <div>
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
          }
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
            <WalkDistanceInfo
              location={'Engineering Quad'}
              walkDistance={Math.round(travelTimes?.engQuadWalking || 0)}
            />
            <WalkDistanceInfo
              location={'Ho Plaza'}
              walkDistance={Math.round(travelTimes?.hoPlazaWalking || 0)}
            />
            <WalkDistanceInfo
              location={'Ag Quad'}
              walkDistance={Math.round(travelTimes?.agQuadWalking || 0)}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default MapInfo;
