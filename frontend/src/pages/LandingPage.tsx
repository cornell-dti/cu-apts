import { makeStyles } from '@material-ui/core/styles';
import React, { ReactElement } from 'react';
import LogoIcon from '../assets/navbar-logo.svg';

const useStyles = makeStyles({
  landingPage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#FFF6F6',
  },
  contentContainer: {
    display: 'flex', // Create a flex container
    alignItems: 'center', // Center items vertically within the container
    gap: '20px', // Add spacing between text and image
    textAlign: 'center',
  },
  centeredContent: {
    fontSize: '30px',
    fontWeight: 'bold',
    color: '#B94630',
  },
  logoImage: {
    maxWidth: '100px', // Adjust the maximum width as needed
  },
});

const LandingPage = (): ReactElement => {
  const classes = useStyles();

  return (
    <div className={classes.landingPage}>
      <div className={classes.contentContainer}>
        <img src={LogoIcon} alt="CU Apts Logo" className={classes.logoImage} />
        <div className={classes.centeredContent}>
          <p>Please come back later on September 7th!</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
