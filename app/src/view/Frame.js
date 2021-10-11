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

type Props = {|
  children: React$Node
|};

const Frame = ({ children }: Props):React$Node => {
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