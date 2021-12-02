
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
import theme from '../theme';


const API = process.env.REACT_APP_API_URI || '';

const App = ():React$Node => {
  return (
    <BrowserRouter>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        sleep
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;

