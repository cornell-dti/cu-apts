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
import recenterIcon from '../../assets/recenter-icon.svg';
import closeMapIcon from '../../assets/close-map-icon.svg';
import { Marker } from './Marker';
import React, { Dispatch, SetStateAction } from 'react';

const useStyles = makeStyles((theme) => ({
  paper: {
    borderRadius: '13.895px',
    maxWidth: '100%',
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
}));

type Props = {
  open: boolean;
  onClose: () => void;
  setOpen: Dispatch<SetStateAction<boolean>>;
  readonly address: string | null;
  readonly latitude?: number;
  readonly longitude?: number;
  readonly walkTime?: number;
  readonly driveTime?: number;
};

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
  open,
  onClose,
  setOpen,
  address,
  latitude = 0,
  longitude = 0,
  walkTime = 0,
  driveTime = 0,
}: Props) => {
  const { paper, recenterButton } = useStyles();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        className: paper,
      }}
    >
      <Box style={{ margin: '29.777px', width: '934px', height: '744px' }}>
        <DialogTitle style={{ padding: 0, margin: 0 }}>
          <Grid
            container
            justifyContent="space-between"
            alignItems="center"
            style={{ marginTop: '5px' }}
          >
            <Grid item>
              <Typography
                variant="h6"
                style={{ fontWeight: 600, fontSize: '23px', lineHeight: '36px' }}
              >
                {address}
              </Typography>
            </Grid>
            <Grid item>
              <DialogActions>
                <IconButton onClick={() => setOpen(false)} disableRipple>
                  <img
                    src={closeMapIcon}
                    alt={'recenter-icon'}
                    style={{ width: '21.4px', height: '21.4px' }}
                  />
                </IconButton>
              </DialogActions>
            </Grid>
          </Grid>
        </DialogTitle>

        <DialogContent style={{ padding: 0 }}>
          <Box style={{}}>
            <div
              style={{
                height: '450px',
                width: '934px',
                borderRadius: '12.764px',
                overflow: 'hidden',
                outline: 'none',
                position: 'relative',
              }}
            >
              <div
                style={{
                  height: '500px',
                  width: '934px',
                  borderRadius: '12.764px',
                  overflow: 'hidden',
                  outline: 'none',
                  position: 'absolute',
                  borderColor: '1px solid red',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%,-50%)',
                }}
              >
                <GoogleMapReact
                  bootstrapURLKeys={{
                    key: process.env.REACT_APP_MAPS_API_KEY || 'can not find api',
                  }}
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
                    src={aptIcon}
                    altText="Engineering Quad icon"
                  />
                  <Marker
                    lat={42.449014547431425}
                    lng={-76.48413980587392}
                    src={aptIcon}
                    altText="Arts Quad icon"
                  />
                  <Marker
                    lat={42.446768276610875}
                    lng={-76.48505175766948}
                    src={aptIcon}
                    altText="Ho Plaza icon"
                  />
                  <Marker
                    lat={42.448929851009716}
                    lng={-76.47804712490351}
                    src={aptIcon}
                    altText="Ag Quad icon"
                  />
                </GoogleMapReact>
              </div>
              <IconButton disableRipple className={recenterButton}>
                <img
                  src={recenterIcon}
                  alt={'recenter-icon'}
                  style={{ width: '21.4px', height: '21.4px' }}
                />
              </IconButton>
            </div>
            <Box>
              <Box mt={1.5}>
                <Typography variant="h6" style={{ fontWeight: 600, fontSize: '20px' }}>
                  {address}
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" style={{ fontWeight: 400, fontSize: '18px' }}>
                  Distance from Campus
                </Typography>
                <Grid container justifyContent="flex-start" spacing={1}>
                  <Grid item>
                    <img src={walkIcon} alt={'walk-icon'} />
                  </Grid>
                  <Grid item>
                    <Typography variant="h6" style={{ fontWeight: 400, fontSize: '18px' }}>
                      {walkTime} min
                    </Typography>
                  </Grid>
                  <Grid item style={{ marginLeft: '8px' }}>
                    <img src={driveIcon} alt={'drive-icon'} />
                  </Grid>
                  <Grid item>
                    <Typography variant="h6" style={{ fontWeight: 400, fontSize: '18px' }}>
                      {driveTime} min
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Box>
    </Dialog>
  );
};

export default MapModal;
