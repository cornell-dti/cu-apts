import React, { ReactElement } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import styles from './ProgressSpinner.module.scss';

export default function ProgressSpinner(): ReactElement {
  return (
    <div className={styles.container}>
      <Spinner animation="border" className={styles.spinner} />
    </div>
  );
}
