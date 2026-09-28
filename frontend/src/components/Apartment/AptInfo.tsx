import React, { ReactElement } from 'react';
import Info from './Info';
import { Box, Divider } from '@material-ui/core';
import PropertyInfo from '../Review/PropertyInfo';
import { CardData } from '../../App';

type Props = {
  readonly landlordId: string | null;
  readonly landlord: string;
  readonly contact: () => void;
  readonly address: string | null;
  readonly buildings: CardData[];
  readonly latitude?: number;
  readonly longitude?: number;
};

/**
 * AptInfo – Displays landlord information and other properties owned by the landlord.
 *
 * @remarks
 * This component combines landlord contact information with a list of other properties
 * they own. It is used on the apartment page to provide context about the landlord.
 *
 * @param {string | null} props.landlordId – The unique identifier for the landlord.
 * @param {string} props.landlord – The name of the landlord or renting company.
 * @param {string | null} props.contact – Contact URL for the landlord.
 * @param {string | null} props.address – The address of the apartment.
 * @param {CardData[]} props.buildings – List of other properties owned by the landlord.
 *
 * @return {ReactElement} – The rendered AptInfo component.
 */
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
