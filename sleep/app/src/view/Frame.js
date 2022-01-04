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
  Box,
  Snackbar,
  Alert
} from '@mui/material';
import Navigation from '@view/Navigation';
import Login from '@view/Login';
import DateBar from '@view/DateBar';
import { useUser } from '@service/user';
import { useSnack } from '@service/snackbar';

type Props = {|
  children: React$Node
|};

const Frame = ({ children }: Props):React$Node => {
  const [ user, refreshUser ] = useUser();
  const [ snack, setSnack ] = useSnack();

  const closeSnack = () => setSnack(null);

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
      <DateBar />
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
      <Snackbar 
        open={Boolean(snack)} 
        onClose={closeSnack}
        autoHideDuration={6000}
        sx={{ bottom: { xs: 90 } }}
      >
        {snack && (
          <Alert severity={snack.type} onClose={closeSnack}>
            {snack.text}
          </Alert>
        )}
      </Snackbar>
      <Box component='nav'>
        <Navigation />
      </Box>
    </Stack>
  )
};

export default Frame;