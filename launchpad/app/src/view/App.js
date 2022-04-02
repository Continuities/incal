
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
  CssBaseline , 
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ThemeProvider
} from '@mui/material/styles';
import theme from '../theme';
import {
  Logout
} from '@mui/icons-material';
import { 
  CircleLayout, 
  Radian 
} from '@view/CircularLayout';
import Frame from '@view/Frame';

const Pins = ["Users", "Sleep", "Bees"];
const rad = 2* Math.PI;
const API ='http://localhost/launchpad/api';

const App = ():React$Node => {
  return (
    <BrowserRouter basename={'/launchpad/'}>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <Frame>
        <CircleLayout radius={15}>             
          {Pins.map((pin,index) => (
            <Radian radian={(rad/Pins.length)*(index+1)}>
            <Tooltip title={pin}>
              <IconButton >
                <Logout />
              </IconButton>
            </Tooltip>
            </Radian>
          ))}
        </CircleLayout>
        </Frame> 
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;




