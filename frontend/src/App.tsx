import React, { ReactElement } from 'react';
import './App.scss';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HomePage from './pages/HomePage';
import FAQPage from './pages/FAQPage';
import ReviewPage from './pages/ReviewPage';
import LandlordPage from './pages/LandlordPage';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';
import NavBar, { NavbarButton } from './components/utils/NavBar';
import NotFoundPage from './pages/NotFoundPage';
import { Apartment, ApartmentWithId } from '../../common/types/db-types';
import Footer from './components/utils/Footer';
import { hotjar } from 'react-hotjar';
import { HJID, HJSV } from './constants/hotjar';
import Policies from './pages/Policies';
import ApartmentPage from './pages/ApartmentPage';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#B94630',
    },
    secondary: {
      main: '#cccccc',
    },
  },
  typography: {
    fontFamily: ['-apple-system', 'BlinkMacSystemFont', '"Work Sans"'].join(','),
  },
  overrides: {
    MuiFormLabel: {
      root: {
        color: '#000000',
      },
      colorSecondary: {
        color: '#929292',
      },
    },
  },
});

const home: NavbarButton = {
  label: 'Home',
  href: '/',
};

const review: NavbarButton = {
  label: 'Reviews',
  href: '/reviews',
};

export type CardData = {
  buildingData: ApartmentWithId;
  numReviews: number;
  company?: string;
};

const headersData = [home, review];

hotjar.initialize(HJID, HJSV);

const App = (): ReactElement => {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <NavBar headersData={headersData} />
        <div className="root">
          <Switch>
            <Route exact path="/" component={HomePage} />
            <Route exact path="/faq" component={FAQPage} />
            <Route exact path="/reviews" component={ReviewPage} />
            <Route exact path="/policies" component={Policies} />
            <Route path="/landlord/:landlordId" component={LandlordPage} />
            <Route path="/apartment/:aptId" component={ApartmentPage} />
            <Route component={NotFoundPage} />
          </Switch>
        </div>
        <Footer />
      </Router>
    </ThemeProvider>
  );
};

export default App;
