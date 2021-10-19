/**
 * Main App entry point
 * @author mtownsend
 * @since October 05, 2021
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
import Home from '@view/Home';
import ProfilePage from '@view/ProfilePage';
import Frame from '@view/Frame';
import Settings from '@view/Settings';
import Directory from '@view/Directory';
import theme from '../theme';
import { Server, Client } from '../config';

const API = process.env.REACT_APP_API_URI || '';

const App = ():React$Node => {
  return (
    <BrowserRouter>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <auth.TokenProvider client={Client} server={Server}>
          <api.ApiProvider uri={API}>
            <auth.UserProvider>
              <Frame>
                <Routes>
                  <Route path='/users' element={<Directory />} />
                  <Route path='/settings' element={<Settings />} />
                  <Route path='/:email' element={<ProfilePage />} />
                  <Route exact path='/' element={<Home />} />
                </Routes>
              </Frame>
            </auth.UserProvider>
          </api.ApiProvider>
        </auth.TokenProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;