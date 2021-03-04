import React, { ReactElement } from 'react';
import './App.scss';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HomePage from './pages/HomePage';
import FAQPage from './pages/FAQPage';
import LandlordPage from './pages/LandlordPage';

const App = (): ReactElement => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route exact path="/faq" component={FAQPage} />
        <Route path="/landlord/:landlordId" component={LandlordPage} />
      </Switch>
    </Router>
  );
};

export default App;
