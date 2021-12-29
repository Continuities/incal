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
import { setCookie } from '@service/cookie';
import { Client, Server } from '../config';

import type { ClientConfig, Token } from '@authweb/service';

type Props = {|
  onLogin?: () => void
|};

const Login = ({ onLogin = () => {} }: Props):React$Node => {
  const navigate = useNavigate();
  const state = useMemo(crypto.generateRandomString, []);
  const { params } = auth.useOAuth2(Client, state);
  setCookie('state', state);
  
  // TODO: I think things can get weird, with multiple state cookies conflicting

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
          onCode={onLogin}
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