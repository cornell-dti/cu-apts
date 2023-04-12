import React, { ReactElement } from 'react';
import Info from './Info';
import PropertyInfo from './PropertyInfo';
import { Card, CardContent, Divider } from '@material-ui/core';
import { CardData } from '../../App';

type Props = {
  readonly buildings: CardData[];
  readonly contact: string | null;
  readonly address: string | null;
};

export default function InfoFeatures({ buildings, contact, address }: Props): ReactElement {
  return (
    <Card variant="outlined">
      <CardContent>
        <Info contact={contact} address={address} />
        <Divider />
        <PropertyInfo title="Properties Owned" info={buildings} />
      </CardContent>
    </Card>
  );
}
