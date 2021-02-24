import React, { ReactElement, useState, useEffect } from 'react';
import FAQNavBar from '../components/FAQ/FAQNavBar';
import FAQHelp from '../components/FAQHelp/FAQHelp';
import Faqs from '../components/FAQ';
import ProgressSpinner from '../components/utils/ProgressSpinner';
import axios from 'axios';
import styles from './FAQPage.module.scss';

export type FAQ = {
  question: string;
  answer: string;
};

export type FAQData = {
  headerName: string;
  faqs: FAQ[];
};

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
      <FAQNavBar />
      <div className={styles.faqHelp}>
        <FAQHelp />
      </div>

      <div className={styles.faqHeaderTitle}>
        <h2>Frequently Asked Questions</h2>
      </div>
      {data ? <Faqs data={data} /> : <ProgressSpinner />}
    </div>
  );
};

export default FAQPage;
