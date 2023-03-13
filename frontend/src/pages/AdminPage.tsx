import React, { ReactElement } from 'react';
import styles from './FAQPage.module.scss';
import { useTitle } from '../utils';
import { Button, ThemeProvider, Typography, makeStyles } from '@material-ui/core';
import { createTheme } from '@material-ui/core/styles';
import { colors } from '../colors';

const muiTheme = createTheme({
  palette: { primary: { main: colors.green1 }, secondary: { main: colors.red1 } },
});

const useStyles = makeStyles(() => ({
  approveButton: {
    fontFamily: 'Work Sans, sans-serif',
    size: '100px',
    fontSize: '40px',
    lineHeight: '70px',
    letterSpacing: '0.01em',
    textTransform: 'none',
    background: '#5aa17f',
  },
  rejectButton: {
    fontFamily: 'Work Sans, sans-serif',
    size: '100px',
    fontSize: '40px',
    lineHeight: '70px',
    letterSpacing: '0.01em',
    textTransform: 'none',
    marginLeft: '40px',
    background: '#FF8A8A',
  },
}));

const AdminPage = (): ReactElement => {
  const { approveButton, rejectButton } = useStyles();
  useTitle('Admin');
  return (
    <div className={styles.faqPage}>
      <div className={styles.faqHeaderTitle}>
        <Typography variant="h5">Admin Page</Typography>
      </div>
      <ThemeProvider theme={muiTheme}>
        <Button
          {...{
            color: 'primary',
            className: approveButton,
          }}
        >
          {'Approve'.toUpperCase()}
        </Button>
        <Button
          {...{
            color: 'secondary',
            className: rejectButton,
          }}
        >
          {'Reject'.toUpperCase()}
        </Button>
      </ThemeProvider>
    </div>
  );
};

export default AdminPage;
