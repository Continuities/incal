/**
 * Main viewport frame
 * @author mtownsend
 * @since October 08, 2021
 * @flow
 **/

import React from 'react';
import {
  Grid
} from '@mui/material';
import Navigation from '@view/Navigation';
import Login from '@view/Login';
import { auth } from '@authweb/service';

type Props = {|
  children: React$Node
|};

const Frame = ({ children }: Props):React$Node => {
  const { token } = auth.useToken();
  if (!token) {
    return <Login />;
  }
  return (
    <Grid 
      container
      direction='column'
      wrap='nowrap'
      sx={{
        height: 1
      }}
    >
      <Grid 
        item
        component='main'
        sx={{
          overflow: 'auto',
          position: 'relative',
          flexGrow: 1         
        }}
      >
        {children}
      </Grid>
      <Grid component='nav' item>
        <Navigation />
      </Grid>
    </Grid>
  )
};

export default Frame;