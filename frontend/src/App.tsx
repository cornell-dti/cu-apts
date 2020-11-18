import React, { ReactElement } from 'react';
import './App.scss';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import HomePage from './pages/HomePage'
import FaqPage from './pages/FaqPage'

const App = (): ReactElement => {

  return (
    <Router>
      <Switch>
        <Route exact path='/' component={HomePage} />
        <Route exact path='/faq' component={FaqPage} />
      </Switch>
    </Router>
  );
}

export default App;
