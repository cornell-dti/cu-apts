import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './components/FAQ/CollapsibleFAQ.module.scss';
import App from './App';
import reportWebVitals from './reportWebVitals';
import axios from 'axios';

// Probably put this value in .env file
axios.defaults.baseURL = process.env.REACT_APP_BASE_URL;

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
