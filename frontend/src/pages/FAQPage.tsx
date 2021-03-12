import React, { ReactElement, useState, useEffect } from 'react';
import NavBar, { NavbarButton } from '../components/utils/NavBar';
import Faqs from '../components/FAQ';
import ProgressSpinner from '../components/utils/ProgressSpinner';
import axios from 'axios';
import styles from './FAQPage.module.scss';
import { Typography } from '@material-ui/core';

export type FAQ = {
  question: string;
  answer: string;
};

export type FAQData = {
  headerName: string;
  faqs: FAQ[];
};

const review: NavbarButton = {
  label: 'Reviews',
  href: '/reviews',
};

const headersData = [review];

const FAQPage = (): ReactElement => {
  const [data, setData] = useState([]);
  useEffect(() => {
    axios
      .get('http://localhost:8080/')
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.log('error', error);
      });
  }, []);
  return (
    <div className={styles.faqPage}>
      <NavBar headersData={headersData} />
      <div className={styles.faqHeaderTitle}>
        <Typography variant="h5">Frequently Asked Questions</Typography>
      </div>
      {data ? <Faqs data={data} /> : <ProgressSpinner />}
    </div>
  );
};

export default FAQPage;
