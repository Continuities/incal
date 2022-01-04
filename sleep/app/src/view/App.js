
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
import Places from '@view/Places';
import Place from '@view/Place';
import Bookings from '@view/Bookings';
import Settings from '@view/Settings';
import { DateProvider } from '@service/date';
import { SnackProvider } from "@service/snackbar";

const API = process.env.REACT_APP_API_URI || 'http://localhost/sleep/api';

const App = ():React$Node => {
  return (
    <BrowserRouter basename={process.env.BASE_URI}>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <SnackProvider>
          <auth.TokenProvider client={Client} server={Server}>
            <api.ApiProvider uri={API}>
              <UserProvider>
                <DateProvider>
                  <Frame>
                    <Routes>
                      <Route path='/settings' element={<Settings />} />
                      <Route path='/place/:id' element={<Place /> } />
                      <Route path='/bookings' element={<Bookings />} />
                      <Route exact path='/' element={<Places />} />
                    </Routes>
                  </Frame>
                </DateProvider>
              </UserProvider>
            </api.ApiProvider>
          </auth.TokenProvider>
        </SnackProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;

