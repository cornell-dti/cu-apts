import React, { ReactElement } from 'react';
import Info from './Info';
import PropertyInfo from './PropertyInfo';
import { Card, CardContent } from '@material-ui/core';
import styles from './Review.module.scss';

type Props = {
  readonly propertyInfo: string[];
  readonly propertyFeatures: string[];
  readonly phone: string;
  readonly address: string;
};

export default function InfoFeatures({
  propertyInfo,
  propertyFeatures,
  phone,
  address,
}: Props): ReactElement {
  return (
    <Card variant="outlined">
      <CardContent>
        <Info phone={phone} address={address} />
        <div className={styles.divider}></div>
        <PropertyInfo title="Property Info" info={propertyInfo} />
        <div className={styles.divider}></div>
        <PropertyInfo title="Property Features" info={propertyFeatures} />
      </CardContent>
    </Card>
  );
}
