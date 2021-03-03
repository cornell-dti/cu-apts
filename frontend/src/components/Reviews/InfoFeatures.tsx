import React, { ReactElement } from 'react';
import Grid from '@material-ui/core/Grid';
import Info from './Info';
import Features from './Features';
import home from '../../assets/home.png';

type Props = {
  readonly features: string[];
  readonly phone: string;
  readonly address: string;
};

export default function InfoFeatures({ features, phone, address }: Props): ReactElement {
  return (
    <Grid item xs={12} sm={3}>
      <Grid container spacing={3}>
        <Grid item sm={12}>
          <Info image={home} phone={phone} address={address} />
        </Grid>
        <Grid item sm={12}>
          <Features features={features} />
        </Grid>
      </Grid>
    </Grid>
  );
}
