/**
 * Main content container
 * @author mtownsend
 * @since October 08, 2021
 * @flow
 **/

import React from 'react';
import {
  Box,
  Container
} from '@mui/material';

type Props = {|
  children: React$Node
|};

const Content = ({ children }: Props):React$Node => (
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
);

export default Content;