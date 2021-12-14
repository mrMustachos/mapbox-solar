import React from 'react';
import ReactDOM from 'react-dom';
import 'normalize.css';

import Map from './Map';
import Typography from './styles/Typography';
import GlobalStyles from './styles/GlobalStyles';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <Typography />
    <GlobalStyles />
    <Map />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
