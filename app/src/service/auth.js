/**
 * Authorisation service
 * @author mtownsend
 * @since October 05, 2021
 * @flow
 **/

import React, { 
  createContext, 
  useContext, 
  useState,
  useEffect
} from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { 
  generateRandomString,
  pkceChallengeFromVerifier
} from "./crypto";
import { useStorage } from '@service/storage';
import OAuthPopup from 'react-oauth-popup';
import { 
  Container,
  Button
} from '@material-ui/core';

const SERVER = {
  authorize: 'http://localhost:8080/oauth/authorize',
  token: 'http://localhost:8080/oauth/token'
};

const CLIENT = {
  id: 'spa',
  name: 'Test SPA',
  grantType: 'authorization_code',
  redirectUri: 'http://localhost:3000' // TODO
};

const STORAGE_KEY = 'nyan';
const TOKEN_KEY = 'nyanyan';

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

const isExpired = (time:Date):bool => Date.now() > time;

type Props = {|
  children: React$Node
|}

const AuthContext = createContext([ null, () => {} ]);
export const AuthProvider = ({ children }:Props):React$Node => {
  const [ token, setToken, removeToken ] = useStorage(TOKEN_KEY);
  const [ authHtml, setAuthHtml ] = useState(null);
  const code = new URLSearchParams(useLocation().search).get('code') || null;
  const history = useHistory();
  const [ authState, setAuthState ] = useState(generateRandomString());
  const [ verify, setVerify ] = useState(generateRandomString());
  const [ params, setParams ] = useState(null);

  useEffect(() => {
    if (!verify) {
      return;
    }
    pkceChallengeFromVerifier(verify)
      .then(challenge => setParams(new URLSearchParams({
        response_type: 'code',
        client_id: CLIENT.id,
        state: authState,
        scope: 'user_info:read',
        redirect_uri: CLIENT.redirectUri,
        code_challenge: challenge,
        code_challenge_method: 'S256'
      }).toString()));
  }, [ verify ])

  return (
    <AuthContext.Provider value={[ token, removeToken ]}>
      { token ? children : params && (
        <OAuthPopup
          url={`http://localhost:8080/oauth/authorize?${params}`}
          onCode={code => 
            getToken(code)
            .then(token => {
              setToken(token);
              history.replace({});
            })}
          onClose={() => {}}>
          <Container maxWidth='sm'>
            <Button>Log in</Button>
          </Container>
        </OAuthPopup>
      )}
    </AuthContext.Provider>
  );
};

export const useToken = ():[ any, () => void ] => useContext(AuthContext);