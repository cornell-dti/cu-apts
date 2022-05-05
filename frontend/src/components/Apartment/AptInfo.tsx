import React, { ReactElement } from 'react';
import Info from './Info';
import { Card, CardContent, Grid } from '@material-ui/core';
import PropertyInfo from '../Review/PropertyInfo';
import { CardData } from '../../App';

type Props = {
  readonly landlord: string;
  readonly contact: string | null;
  readonly address: string | null;
  readonly buildings: CardData[];
};

export default function AptInfo({ landlord, contact, address, buildings }: Props): ReactElement {
  return (
    <Grid container>
      <Grid item xs={12}>
        <Card variant="outlined">
          <CardContent>
            <Info landlord={landlord} contact={contact!} address={address!} />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <PropertyInfo title="Other Properties Owned" info={buildings} />
      </Grid>
    </Grid>
  );
}
