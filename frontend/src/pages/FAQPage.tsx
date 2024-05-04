import React, { ReactElement, useState, useEffect } from 'react';
import Faqs from '../components/FAQ';
import ProgressSpinner from '../components/utils/ProgressSpinner';
import { useTitle } from '../utils';
import { Button, Grid, Typography, makeStyles } from '@material-ui/core';
import { get } from '../utils/call';
import { colors } from '../colors';

export type FAQ = {
  question: string;
  answer: string;
};

/**
 * FAQPage Component
 *
 * This component represents a page for frequently asked questions.
 * It displays all the questions and answers from our database in a concise and simple view.
 * Additionally, the page also has a contact us button when the user has further questions.
 *
 * @component
 * @returns ReactElement: The FAQ page component.
 */
const FAQPage = (): ReactElement => {
  const [data, setData] = useState<FAQ[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const useStyles = makeStyles(() => ({
    pageBackground: {
      backgroundColor: colors.gray3,
      padding: isMobile ? '24px 34px 0' : '96px 135px 0',
      minHeight: 'calc(120vh - 96px)',
    },
    title: {
      color: colors.black,
      fontSize: isMobile ? '18px' : '42px',
      fontWeight: 600,
      lineHeight: isMobile ? '28px' : '60px',
      marginBottom: isMobile ? '1px' : '20px',
    },
    subtitle: {
      color: colors.black,
      fontSize: isMobile ? '12px' : '20px',
      fontWeight: 400,
      lineHeight: isMobile ? '16px' : '28px',
      marginBottom: isMobile ? '24px' : '32px',
    },
    squareButton: {
      backgroundColor: colors.red1,
      color: 'white',
      '&:hover': {
        backgroundColor: colors.darkred,
      },
      padding: isMobile ? '8px 12px' : '8px 18px',
      fontFamily: 'Work Sans, sans-serif',
      fontWeight: 600,
      fontSize: isMobile ? '12px' : '16px',
      borderRadius: '10px',
      lineHeight: isMobile ? '16px' : '26px',
    },
    sideBar: {
      backgroundColor: colors.white,
      padding: '20px',
      borderRadius: '8px',
      width: isMobile ? 'auto' : '275px',
      height: isMobile ? '200px' : 'fit-content',
      marginLeft: isMobile ? '0' : '48px',
      '@media only screen and (max-width: 960px)': {
        marginLeft: '0',
      },
      border: '1px solid' + colors.gray5,
      marginTop: isMobile ? '16px' : '0',
    },
    sideBarTitle: {
      fontSize: isMobile ? '10px' : '20px',
      fontWeight: 600,
      lineHeight: isMobile ? '14px' : '26px',
      paddingBottom: '6px',
    },
    sideBarBlurb: {
      fontSize: isMobile ? '10px' : '16px',
      fontWeight: 400,
      lineHeight: isMobile ? '14px' : '25px',
      paddingBottom: '18px',
    },
  }));
  const { squareButton, sideBar, pageBackground, title, subtitle, sideBarTitle, sideBarBlurb } =
    useStyles();

  useTitle('FAQ');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    get<FAQ[]>(`/api/faqs`, {
      callback: setData,
    });
  }, []);

  return (
    <div className={pageBackground}>
      <Grid container direction="column" alignItems="stretch">
        {/* Title */}
        <Grid item xs={12}>
          <Typography variant="h1" className={title}>
            Frequently Asked Questions
          </Typography>
        </Grid>
        {/* Subtitle */}
        <Grid item xs={12} md={8}>
          <Typography variant="subtitle1" className={subtitle}>
            Finding off-campus housing can be a daunting process. To assist you in your search,
            we've compiled answers to some of our most frequently asked questions.
          </Typography>
        </Grid>
        {/* FAQ Questions and Sidebar*/}
        <Grid item>
          <Grid container direction="row" justifyContent="space-between">
            {/* FAQ Questions */}
            <Grid item xs={12} md>
              {data ? <Faqs data={data} /> : <ProgressSpinner />}
            </Grid>
            {/* Sidebar */}
            {!isMobile && (
              <Grid item xs={12} md={'auto'} className={sideBar}>
                <Typography variant="h1" className={sideBarTitle}>
                  Still have questions?
                </Typography>
                <Typography variant="body1" className={sideBarBlurb}>
                  Can't find the answer you're looking for? Feel free to reach out to our team.
                </Typography>
                <Button href="mailto:hello@cornelldti.org" className={squareButton}>
                  Get In Touch
                </Button>
              </Grid>
            )}
          </Grid>
        </Grid>
        {isMobile && (
          <Grid item xs={12} className={sideBar}>
            <Typography variant="h1" className={sideBarTitle}>
              Still have questions?
            </Typography>
            <Typography variant="body1" className={sideBarBlurb}>
              Can't find the answer you're looking for? Feel free to reach out to our team.
            </Typography>
            <Button href="mailto:hello@cornelldti.org" className={squareButton}>
              Get In Touch
            </Button>
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default FAQPage;
