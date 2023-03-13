import React, { ReactElement } from 'react';
import styles from './FAQPage.module.scss';
import { useTitle } from '../utils';
import { Typography } from '@material-ui/core';

const AdminPage = (): ReactElement => {
  useTitle('Admin');
  return (
    <div className={styles.faqPage}>
      <div className={styles.faqHeaderTitle}>
        <Typography variant="h5">Admin Page</Typography>
      </div>
    </div>
  );
};

export default AdminPage;
