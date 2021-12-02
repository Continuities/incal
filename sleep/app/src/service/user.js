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

const UserContext = createContext<?User>();
type Props = {|
  children: React$Node
|};
export const UserProvider = ({ children }: Props):React$Node => {
  const [ user, setUser ] = useState(null);
  const Api = api.useApi();

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
  }, [ Api.doGet ]);

  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = ():?User => useContext(UserContext);