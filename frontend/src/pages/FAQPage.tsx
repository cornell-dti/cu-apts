import React, { ReactElement, useState, useEffect } from 'react';
import Faqs from '../components/FAQ';
import ProgressSpinner from '../components/utils/ProgressSpinner';
import styles from './FAQPage.module.scss';
import { useTitle } from '../utils';
import { Typography } from '@material-ui/core';
import get from '../utils/get';

export type FAQ = {
  question: string;
  answer: string;
};

export type FAQData = {
  headerName: string;
  faqs: FAQ[];
};

const FAQPage = (): ReactElement => {
  const [data, setData] = useState<FAQData[]>([]);

  useTitle('FAQ');

  useEffect(() => {
    get<FAQData[]>('/', setData);
  }, []);
  return (
    <div className={styles.faqPage}>
      <div className={styles.faqHeaderTitle}>
        <Typography variant="h5">Frequently Asked Questions</Typography>
      </div>
      {data ? <Faqs data={data} /> : <ProgressSpinner />}
    </div>
  );
};

export default FAQPage;
