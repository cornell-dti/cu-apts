import React, { ReactElement } from 'react';
import Info from './Info';
import { Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { colors } from '../../colors';
import PropertyInfo from '../Review/PropertyInfo';
import { CardData } from '../../App';
import { LeaseSignedStats } from '../../../../common/types/db-types';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    padding: '24px 20px',
    border: `1px solid ${colors.gray5}`,
    borderRadius: '9px',
  },
  divider: {
    backgroundColor: colors.gray5,
  },
}));

type Props = {
  readonly landlordId: string | null;
  readonly landlord: string;
  readonly contact: () => void;
  readonly address: string | null;
  readonly aptName?: string | null;
  readonly leaseSignedStats?: LeaseSignedStats;
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
 * @param {string | null} props.aptName – The name of this apartment, shown in the lease signing callout.
 * @param {LeaseSignedStats} props.leaseSignedStats – Average months leases are signed before they start.
 * @param {CardData[]} props.buildings – List of other properties owned by the landlord.
 *
 * @return {ReactElement} – The rendered AptInfo component.
 */
export default function AptInfo({
  landlordId,
  landlord,
  contact,
  address,
  aptName,
  leaseSignedStats,
  buildings,
  latitude = 0,
  longitude = 0,
}: Props): ReactElement {
  const { root, divider } = useStyles();
  return (
    <div className={root}>
      <Info
        landlordId={landlordId}
        landlord={landlord}
        contact={contact!}
        address={address!}
        aptName={aptName}
        leaseSignedStats={leaseSignedStats}
      />
      <Divider className={divider} />
      <PropertyInfo title="Other Properties Owned by This Landlord" info={buildings} />
    </div>
  );
}
