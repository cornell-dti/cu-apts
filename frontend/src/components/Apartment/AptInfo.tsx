import React, { ReactElement } from 'react';
import Info from './Info';
import { Box, Divider } from '@material-ui/core';
import PropertyInfo from '../Review/PropertyInfo';
import { CardData } from '../../App';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

type Props = {
  readonly landlordId: string | null;
  readonly landlord: string;
  readonly contact: string | null;
  readonly address: string | null;
  readonly buildings: CardData[];
  readonly latitude?: number;
  readonly longtitude?: number;
};

export default function AptInfo({
  landlordId,
  landlord,
  contact,
  address,
  buildings,
  latitude = 0,
  longtitude = 0,
}: Props): ReactElement {
  return (
    <div>
      <Box border={1} borderColor="grey.300" borderRadius={10}>
        <APIProvider apiKey={'TODO: mapAPI'}>
          <Map defaultCenter={{ lat: latitude, lng: longtitude }} defaultZoom={10}>
            <Marker position={{ lat: latitude, lng: longtitude }} />
          </Map>
        </APIProvider>
      </Box>
      <Divider variant="middle" />
      <Box border={1} borderColor="grey.300" borderRadius={10}>
        <Box mx={2} mt={1}>
          <Info landlordId={landlordId} landlord={landlord} contact={contact!} address={address!} />
        </Box>
        <Divider variant="middle" />
        <Box mx={2} mb={1} mt={2}>
          <PropertyInfo title="Other Properties Owned by This Landlord" info={buildings} />
        </Box>
      </Box>
    </div>
  );
}
