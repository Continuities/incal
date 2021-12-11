
/**
 * Main App entry point
 * @flow
 **/

import React from 'react';
import { 
  BrowserRouter, 
  Routes, 
  Route, 
  useParams 
} from 'react-router-dom';
import { 
  CssBaseline 
} from '@mui/material';
import {
  ThemeProvider
} from '@mui/material/styles';
import { auth, api } from "@authweb/service";
import theme from '../theme';
import { Server, Client } from '../config';
import { UserProvider } from '@service/user';
import Frame from '@view/Frame';

const API = process.env.REACT_APP_API_URI || 'http://localhost/sleep/api';

const App = ():React$Node => {
  return (
    <BrowserRouter>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <auth.TokenProvider client={Client} server={Server}>
          <api.ApiProvider uri={API}>
            <UserProvider>
              <Frame>
                sleep
              </Frame>
            </UserProvider>
          </api.ApiProvider>
        </auth.TokenProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;

