import React, { ReactElement } from 'react';
import './App.scss';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HomePage from './pages/HomePage';
import FAQPage from './pages/FAQPage';
import LandlordPage from './pages/LandlordPage';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';
import NavBar, { NavbarButton } from './components/utils/NavBar';
import Footer from './components/utils/Footer';

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
  href: '/landlord/24',
};

const headersData = [home, review];

const App = (): ReactElement => {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <NavBar headersData={headersData} />
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route exact path="/faq" component={FAQPage} />
          <Route path="/landlord/:landlordId" component={LandlordPage} />
        </Switch>
        <Footer />
      </Router>
    </ThemeProvider>
  );
};

export default App;
