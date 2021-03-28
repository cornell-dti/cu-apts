import React, { ReactElement } from 'react';
import Info from './Info';
import PropertyInfo from './PropertyInfo';
import { Card, CardContent, Divider } from '@material-ui/core';

type Props = {
  readonly properties: string[];
  readonly phone: string;
  readonly address: string;
};

export default function InfoFeatures({ properties, phone, address }: Props): ReactElement {
  return (
    <Card variant="outlined">
      <CardContent>
        <Info phone={phone} address={address} />
        <Divider />
        <PropertyInfo title="Properties Owned" info={properties} />
      </CardContent>
    </Card>
  );
}
