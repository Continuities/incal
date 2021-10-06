/**
 * Main App entry point
 * @author mtownsend
 * @since October 05, 2021
 * @flow
 **/

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { 
  CssBaseline 
} from '@material-ui/core';
import { AuthProvider } from "@service/auth";
import ApiTest from '@view/ApiTest';

const App = ():React$Node => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CssBaseline />
        <ApiTest />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;