
/**
 * Just bootstraps React
 * @flow
 **/

import React from 'react';
window.react = window.React = React;
import ReactDom from 'react-dom';
import App from '@view/App.js';
const app = document.getElementById('app');
app && ReactDom.render(
  <App />,
  app
);

