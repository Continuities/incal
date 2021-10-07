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
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import OAuthPopup from 'react-oauth-popup';
import { 
  generateRandomString, 
  pkceChallengeFromVerifier 
} from "@service/crypto";

import type { Token } from '@service/auth';

const SERVER = {
  authorize: process.env.AUTH_URI || '',
  token: process.env.TOKEN_URI || ''
};

const CLIENT = {
  id: 'spa',
  name: 'Test SPA',
  grantType: 'authorization_code',
  redirectUri: process.env.APP_URI || ''
};

const useStyles = makeStyles(theme => ({
  fullHeight: {
    height: '100vh'
  }
}));

const getToken = async (code:string, verify:string) => {

  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: CLIENT.id,
    redirect_uri: CLIENT.redirectUri,
    code_verifier: verify
  }).toString();

  const response = await fetch(SERVER.token, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params
  });

  return response.json();
};

type Props = {|
  onLogin: Token => void,
|};

const Login = ({ onLogin }: Props):React$Node => {
  const classes = useStyles();
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
      client_id: CLIENT.id,
      state,
      scope: 'user_info:read',
      redirect_uri: CLIENT.redirectUri,
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
      className={classes.fullHeight}
    >
      <Grid item>
        <OAuthPopup
          url={`${SERVER.authorize}?${params}`}
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