/**
 * Splash page for unauthenticated users
 * @author mtownsend
 * @since October 07, 2021
 * @flow
 **/

import React, { useState, useEffect, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { 
  Container,
  Button,
  Grid
} from '@mui/material';
import OAuthPopup from 'react-oauth-popup';
import { 
  generateRandomString, 
  pkceChallengeFromVerifier 
} from "@service/crypto";
import {
  ClientConfig,
  ServerConfig,
  getToken
} from '@service/auth';

import type { Token } from '@service/auth';

type Props = {|
  onLogin: Token => void,
|};

const Login = ({ onLogin }: Props):React$Node => {
  const history = useHistory();
  const [ state, setState ] = useState(generateRandomString());
  const [ verify, setVerify ] = useState(generateRandomString());
  const [ challenge, setChallenge ] = useState(generateRandomString());

  useEffect(() => {
    verify && pkceChallengeFromVerifier(verify)
      .then(setChallenge);
  }, [ verify ]);

  const params = useMemo(() => 
    new URLSearchParams({
      response_type: 'code',
      client_id: ClientConfig.id,
      state,
      scope: 'user_info:read',
      redirect_uri: ClientConfig.redirectUri,
      code_challenge: challenge,
      code_challenge_method: 'S256'
    }).toString(),
    [ state, challenge, verify ]
  );

  return (
    <Grid 
      container
      alignItems='center'
      justifyContent='center'
      sx={{
        height: '100vh'
      }}
    >
      <Grid item>
        <OAuthPopup
          url={`${ServerConfig.authorize}?${params}`}
          onCode={code => 
            getToken(code, verify)
              .then(token => {
                onLogin(token);
                history.replace({});
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