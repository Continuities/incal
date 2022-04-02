/**
 * Main viewport frame
 * @author mtownsend
 * @since October 08, 2021
 * @flow
 **/

import React from 'react';
import {
  Grid,
  Container
} from '@mui/material';
import { auth } from '@authweb/service';

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
          position: 'relative',
          flexGrow: 1         
        }}
      >
        <Container 
          maxWidth='sm'
          sx={{
            height: 1,
            width: 1,
            py: 5
          }
        }>
        {children}
      </Container>
      </Grid>
    </Grid>
  )
};

export default Frame;