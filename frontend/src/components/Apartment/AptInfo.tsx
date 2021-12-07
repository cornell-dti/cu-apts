import React, { ReactElement } from 'react';
import Info from './Info';
import { Card, CardContent, Divider } from '@material-ui/core';

type Props = {
  readonly landlord: string;
  readonly contact: string | null;
  readonly address: string | null;
};

export default function AptInfo({ landlord, contact, address }: Props): ReactElement {
  return (
    <Card variant="outlined">
      <CardContent>
        <Info landlord={landlord} contact={contact!} address={address!} />
        <Divider />
      </CardContent>
    </Card>
  );
}
