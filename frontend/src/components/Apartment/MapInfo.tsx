import React, { ReactElement } from 'react';
import { Box, Grid, Typography } from '@material-ui/core';
import GoogleMapReact from 'google-map-react';
import walkIcon from '../../assets/walk-icon.svg';
import driveIcon from '../../assets/drive-icon.svg';
import aptIcon from '../../assets/fluent_location-12-filled.svg';
import { config } from 'dotenv';

config();

type Props = {
  readonly address: string | null;
  readonly latitude?: number;
  readonly longitude?: number;
  readonly walkTime?: number;
  readonly driveTime?: number;
};

type markerProp = {
  readonly src: string;
  readonly lat: number;
  readonly lng: number;
};

const Marker = ({ src }: markerProp) => (
  <img
    src={src}
    alt="apartment-marker"
    style={{ height: '53.6px', width: '53.6px', transform: 'translate(-50%, -50%)' }}
  />
);

export default function MapInfo({
  address,
  latitude = 0,
  longitude = 0,
  walkTime = 0,
  driveTime = 0,
}: Props): ReactElement {
  console.log(process.env.GOOGLE_MAP_API_KEY);
  return (
    <Box border={1} borderColor="grey.300" borderRadius={10} mb={3}>
      <Box mx={3} my={3}>
        <div
          style={{ height: '331.046px', width: '100%', borderRadius: '10px', overflow: 'hidden' }}
        >
          <GoogleMapReact
            bootstrapURLKeys={{ key: process.env.REACT_APP_MAPS_API_KEY || 'can not find api' }}
            defaultCenter={{ lat: latitude, lng: longitude }}
            defaultZoom={16}
          >
            <Marker lat={latitude} lng={longitude} src={aptIcon} />
          </GoogleMapReact>
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
    </Box>
  );
}
