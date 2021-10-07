/**
 * Main App entry point
 * @author mtownsend
 * @since October 05, 2021
 * @flow
 **/

import React from 'react';
import { 
  BrowserRouter, 
  Switch, 
  Route, 
  useParams 
} from 'react-router-dom';
import { 
  CssBaseline 
} from '@mui/material';
import {
  ThemeProvider
} from '@mui/material/styles';
import { 
  TokenProvider, 
  UserProvider 
} from "@service/auth";
import Home from '@view/Home';
import ProfilePage from '@view/ProfilePage';
import Frame from '@view/Frame';
import Settings from '@view/Settings';
import Directory from '@view/Directory';
import theme from '../theme';

const App = ():React$Node => {
  return (
    <BrowserRouter>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <TokenProvider>
          <UserProvider>
            <Frame>
              <Switch>
                <Route path='/users'>
                  <Directory />
                </Route>
                <Route path='/settings'>
                  <Settings />
                </Route>
                <Route path='/:email'>
                  <ProfilePage />
                </Route>
                <Route exact path='/'>
                  <Home />
                </Route>
              </Switch>
            </Frame>
          </UserProvider>
        </TokenProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;