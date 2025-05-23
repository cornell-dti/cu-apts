import React, { ReactElement } from 'react';
import Info from './Info';
import { Box, Divider } from '@material-ui/core';
import PropertyInfo from '../Review/PropertyInfo';
import { CardData } from '../../App';

type Props = {
  readonly landlordId: string | null;
  readonly landlord: string;
  readonly contact: string | null;
  readonly address: string | null;
  readonly buildings: CardData[];
  readonly latitude?: number;
  readonly longitude?: number;
};

export default function AptInfo({
  landlordId,
  landlord,
  contact,
  address,
  buildings,
  latitude = 0,
  longitude = 0,
}: Props): ReactElement {
  return (
    <Box border={1} borderColor="grey.300" borderRadius={10}>
      <Box mx={2} mt={1}>
        <Info landlordId={landlordId} landlord={landlord} contact={contact!} address={address!} />
      </Box>
      <Divider variant="middle" />
      <Box mx={2} mb={1} mt={2}>
        <PropertyInfo title="Other Properties Owned by This Landlord" info={buildings} />
      </Box>
    </Box>
  );
}
