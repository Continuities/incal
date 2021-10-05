/**
 * Just bootstraps React
 * @author mtownsend
 * @since October 05, 2021
 * @flow
 **/

import React from "react"
import ReactDom from "react-dom"
import App from "@view/App.js"
const app = document.getElementById('app');
app && ReactDom.render(
  <App />,
  app
);