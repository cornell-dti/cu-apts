import React, { ReactElement } from 'react';
import Grid from '@material-ui/core/Grid';
import Info from './Info';
import PropertyInfo from './PropertyInfo';
import styles from './Review.module.scss';

type Props = {
  readonly propertyInfo: string[];
  readonly propertyFeatures: string[];
  readonly phone: string;
  readonly address: string;
};

export default function InfoFeatures({ propertyInfo, propertyFeatures, phone, address }: Props): ReactElement {
  return (
    <Grid item xs={12} sm={4}>
      <Grid container spacing={1}>
        <Grid item sm={12}>
          <Info phone={phone} address={address} />
          {/* <hr /> */}
        </Grid>
        <Grid item sm={12}>
          <PropertyInfo title='Property Info' info={propertyInfo} />
          {/* <hr /> */}
        </Grid>
        <Grid item sm={12}>
          <PropertyInfo title='Property Features' info={propertyFeatures} />
        </Grid>
      </Grid>
    </Grid>
  );
}
