import React, { ReactElement } from 'react';
import './App.scss';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HomePage from './pages/HomePage';
import FAQPage from './pages/FAQPage';
import ReviewModal from './components/LeaveReview/ReviewModal';

const App = (): ReactElement => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route exact path="/faq" component={FAQPage} />
        <Route exact path="/test" component={ReviewModal} />
      </Switch>
    </Router>
  );
};

export default App;
