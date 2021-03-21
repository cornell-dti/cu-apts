import { CircularProgress } from '@material-ui/core';
import React, { ReactElement } from 'react';
import styles from './ProgressSpinner.module.scss';

export default function ProgressSpinner(): ReactElement {
  return (
    <div className={styles.container}>
      <CircularProgress />
    </div>
  );
}
