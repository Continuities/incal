/**
 * Splash page for unauthenticated users
 * @author mtownsend
 * @since October 07, 2021
 * @flow
 **/

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container,
  Button,
  Grid
} from '@mui/material';
import OAuthPopup from 'react-oauth-popup';
import { 
  crypto, 
  auth 
} from "@authweb/service";
import { Client, Server } from '../config';

import type { ClientConfig, Token } from '@authweb/service';

const Login = ():React$Node => {
  const navigate = useNavigate();
  const state = useMemo(crypto.generateRandomString, []);
  const { params, onCode } = auth.useOAuth2(Client, state);

  return (
    <Grid 
      container
      alignItems='center'
      justifyContent='center'
      sx={{
        height: 1
      }}
    >
      <Grid item>
        <OAuthPopup
          url={`${Server.authorizeUri}?${params}`}
          onCode={code => onCode(code).then(() => {
            navigate('/', { replace: true });
          })}
          onClose={() => {}}
        >
          <Button 
            variant='contained'
            color='primary'
          >Login</Button>
        </OAuthPopup>
      </Grid>
    </Grid>
  )
};

export default Login;