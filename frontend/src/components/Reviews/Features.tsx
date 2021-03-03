import React, { ReactElement } from 'react';
import Grid from '@material-ui/core/Grid';
import styles from './Reviews.module.scss';

type Props = {
  readonly features: string[];
};

export default function Features({ features }: Props): ReactElement {
  return (
    <div className={styles.component}>
      <p className={styles.title}>Property Features</p>
      <div className={styles.detail}>
        <Grid container spacing={1} direction="row">
          {features.map((feature, index) => (
            <Grid item xs={12} sm={12} md={12} lg={6} key={index}>
              <li>{feature}</li>
            </Grid>
          ))}
        </Grid>
      </div>
    </div>
  );
}
