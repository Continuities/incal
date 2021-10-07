/**
 * Basic test of the API endpoint
 * @author mtownsend
 * @since October 06, 2021
 * @flow
 **/

import React, { useMemo } from 'react';
import { Container, Button, Typography } from '@material-ui/core';
import { useGet } from '@service/api';
import { useToken } from '@service/auth';

const ApiTest = ():React$Node => {
  const [, logout ] = useToken();
  const response = useGet('/');

  const msg = useMemo(() => {
    switch (response.status) {
      case 'pending': return 'Loading...';
      case 'error': return `Error! ${response.error}`;
      case 'success': return response.result.msg;
    }
  }, [ response ]);

  return (
    <Container maxWidth='sm'>
      <Typography>{msg}</Typography>
      <Button onClick={logout}>Log out</Button>
    </Container>
  );
};

export default ApiTest;