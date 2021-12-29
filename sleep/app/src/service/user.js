/**
 * Provides user context and functions
 * @author mtownsend
 * @since December 10, 2021
 * @flow
 **/

import React, { 
  useState,
  useEffect,
  useContext, 
  createContext 
} from 'react';
import { api } from '@authweb/service';

import type { User } from '@authweb/service';

const UserContext = createContext<[?User, () => void]>([null, () => {}]);
type Props = {|
  children: React$Node
|};
export const UserProvider = ({ children }: Props):React$Node => {

  // TODO: Refactor to use api.useGet

  const [ user, setUser ] = useState(null);
  const [ refreshCode, setRefreshCode ] = useState(0);
  const Api = api.useApi();

  const refresh = () => setRefreshCode(code => code + 1);

  useEffect(() => {
    const abort = new AbortController();
    Api.doGet('/user', null, abort.signal).then(r => {
      switch (r.status) {
        case 'success':
          return setUser(r.result);
        case 'error':
          return setUser(null);
      }
    });
    return () => abort.abort();
  }, [ refreshCode, Api.doGet ]);

  return (
    <UserContext.Provider value={[ user, refresh ]}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = ():[?User, () => void] => useContext(UserContext);