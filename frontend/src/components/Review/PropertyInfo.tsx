import React, { ReactElement } from 'react';
import Grid from '@material-ui/core/Grid';
import styles from './Review.module.scss';
import { Box } from '@material-ui/core';

type Props = {
  readonly info: string[];
  readonly title: string;
};

export default function PropertyInfo({ info, title }: Props): ReactElement {
  return (
    <Box>
      <p className={styles.title}>{title}</p>
      <div className={styles.detail}>
        <Grid container spacing={1} direction="row">
          {info.map((feature, index) => (
            <Grid item xs={6} sm={12} md={6} key={index}>
              <li>{feature}</li>
            </Grid>
          ))}
        </Grid>
      </div>
    </Box>
  );
}
