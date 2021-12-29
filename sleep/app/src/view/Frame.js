/**
 * Main viewport frame
 * @author mtownsend
 * @since October 08, 2021
 * @flow
 **/

import React from 'react';
import {
  Stack,
  Container,
  Box
} from '@mui/material';
import Navigation from '@view/Navigation';
import Login from '@view/Login';
import { useUser } from '@service/user';

type Props = {|
  children: React$Node
|};

const Frame = ({ children }: Props):React$Node => {
  const [ user, refreshUser ] = useUser();
  if (!user) {
    return <Login onLogin={refreshUser} />;
  }
  return (
    <Stack 
      direction='column'
      sx={{
        height: 1
      }}
    >
      <Container 
        maxWidth='sm'
        sx={{
          overflow: 'auto',
          position: 'relative',
          flexGrow: 1         
        }}
      >
        {children}
      </Container>
      <Box component='nav'>
        <Navigation />
      </Box>
    </Stack>
  )
};

export default Frame;