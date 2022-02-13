import React, { ReactElement } from 'react';
import Info from './Info';
import { Card, CardContent, Divider } from '@material-ui/core';
import PropertyInfo from '../Review/PropertyInfo';

type Props = {
  readonly landlord: string;
  readonly contact: string | null;
  readonly address: string | null;
  readonly buildings: readonly string[];
};

export default function AptInfo({ landlord, contact, address, buildings }: Props): ReactElement {
  return (
    <Card variant="outlined">
      <CardContent>
        <Info landlord={landlord} contact={contact!} address={address!} />
        <Divider />
        <PropertyInfo title="Other Properties Owned" info={buildings} />
      </CardContent>
    </Card>
  );
}
