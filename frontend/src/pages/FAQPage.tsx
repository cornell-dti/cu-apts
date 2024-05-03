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

const useStyles = makeStyles(() => ({
  pageBackground: {
    backgroundColor: colors.gray3,
    padding: '96px 135px 0',
    minHeight: 'calc(120vh - 96px)',
  },
  title: {
    color: colors.black,
    fontSize: '42px',
    fontWeight: 600,
    lineHeight: '60px',
    marginBottom: '20px',
  },
  subtitle: {
    color: colors.black,
    fontSize: '20px',
    fontWeight: 400,
    lineHeight: '28px',
    marginBottom: '32px',
  },
  squareButton: {
    backgroundColor: colors.red1,
    color: 'white',
    '&:hover': {
      backgroundColor: colors.red7, // dark-red color on Figma
    },
    padding: '8px 18px',
    fontFamily: 'Work Sans, sans-serif',
    fontWeight: 600,
    fontSize: '16px',
    borderRadius: '10px',
    lineHeight: '26px',
  },
  sideBar: {
    backgroundColor: colors.white,
    padding: '20px',
    borderRadius: '8px',
    width: '275px',
    height: 'fit-content',
    marginLeft: '48px',
    '@media only screen and (max-width: 960px)': {
      marginLeft: '0',
    },
    border: '1px solid' + colors.gray5,
    marginTop: '0',
  },
  sideBarTitle: {
    fontSize: '20px',
    fontWeight: 600,
    lineHeight: '26px',
    paddingBottom: '6px',
  },
  sideBarBlurb: {
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: '25px',
    paddingBottom: '18px',
  },
  pageBackgroundMobile: {
    backgroundColor: colors.gray3,
    padding: '24px 34px 0',
    minHeight: 'calc(120vh - 96px)',
  },
  titleMobile: {
    color: colors.black,
    fontSize: '18px',
    fontWeight: 600,
    lineHeight: '28px',
    marginBottom: '1px',
  },
  subtitleMobile: {
    color: colors.black,
    fontSize: '12px',
    fontWeight: 400,
    lineHeight: '16px',
    marginBottom: '24px',
  },
  squareButtonMobile: {
    backgroundColor: colors.red1,
    color: 'white',
    '&:hover': {
      backgroundColor: colors.red7, // dark-red color on Figma
    },
    padding: '8px 12px',
    fontFamily: 'Work Sans, sans-serif',
    fontWeight: 600,
    fontSize: '12px',
    borderRadius: '10px',
    lineHeight: '16px',
  },
  sideBarMobile: {
    backgroundColor: colors.white,
    padding: '20px',
    borderRadius: '8px',
    width: 'auto',
    height: '200px',
    marginLeft: '0',
    '@media only screen and (max-width: 960px)': {
      marginLeft: '0',
    },
    border: '1px solid' + colors.gray5,
    marginTop: '16px',
  },
  sideBarTitleMobile: {
    fontSize: '10px',
    fontWeight: 600,
    lineHeight: '14px',
    paddingBottom: '6px',
  },
  sideBarBlurbMobile: {
    fontSize: '10px',
    fontWeight: 400,
    lineHeight: '14px',
    paddingBottom: '18px',
  },
}));

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

  const {
    squareButton,
    sideBar,
    pageBackground,
    title,
    subtitle,
    sideBarTitle,
    sideBarBlurb,
    squareButtonMobile,
    sideBarMobile,
    pageBackgroundMobile,
    titleMobile,
    subtitleMobile,
    sideBarTitleMobile,
    sideBarBlurbMobile,
  } = useStyles();

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
    <div className={isMobile ? pageBackgroundMobile : pageBackground}>
      <Grid container direction="column" alignItems="stretch">
        {/* Title */}
        <Grid item xs={12}>
          <Typography variant="h1" className={isMobile ? titleMobile : title}>
            Frequently Asked Questions
          </Typography>
        </Grid>
        {/* Subtitle */}
        <Grid item xs={12} md={8}>
          <Typography variant="subtitle1" className={isMobile ? subtitleMobile : subtitle}>
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
          <Grid item xs={12} className={sideBarMobile}>
            <Typography variant="h1" className={sideBarTitleMobile}>
              Still have questions?
            </Typography>
            <Typography variant="body1" className={sideBarBlurbMobile}>
              Can't find the answer you're looking for? Feel free to reach out to our team.
            </Typography>
            <Button href="mailto:hello@cornelldti.org" className={squareButtonMobile}>
              Get In Touch
            </Button>
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default FAQPage;
