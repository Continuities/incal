/**
 * Basic test of the API endpoint
 * @author mtownsend
 * @since October 06, 2021
 * @flow
 **/

import React, { useEffect, useState } from 'react';
import { Container, Button, Typography } from '@material-ui/core';
import { useToken } from '@service/auth';

const ApiTest = ():React$Node => {
  const [ token, logout ] = useToken();
  const [ msg, setMsg ] = useState('');
  useEffect(() => {
    if (!token) {
      return;
    }

    fetch('http://localhost:8080/', {
      headers: {
        Authorization: `${token.token_type} ${token.access_token}`
      }
    })
      .then(r => r.json())
      .then(j => { 
        setMsg(j.msg); 
      });

  }, [ token ]);

  return (
    <Container maxWidth='sm'>
      <Typography>{msg}</Typography>
      <Button onClick={logout}>Log out</Button>
    </Container>
  );
};

export default ApiTest;