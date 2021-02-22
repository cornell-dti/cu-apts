import React, { ReactElement } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import styles from './FAQSpinner.module.scss';

export default function FAQSpinner(): ReactElement {
  return (
    <div className={styles.container}>
      <Spinner animation="border" className={styles.spinner} />
    </div>
  );
}
