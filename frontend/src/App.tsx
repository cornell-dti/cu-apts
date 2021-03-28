import React, { ReactElement } from 'react';
import './App.scss';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HomePage from './pages/HomePage';
import FAQPage from './pages/FAQPage';
import LandlordPage from './pages/LandlordPage';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#B94630',
    },
    secondary: {
      main: '#cccccc',
    },
  },
});

const App = (): ReactElement => {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route exact path="/faq" component={FAQPage} />
          <Route path="/landlord/:landlordId" component={LandlordPage} />
        </Switch>
      </Router>
    </ThemeProvider>
  );
};

export default App;
