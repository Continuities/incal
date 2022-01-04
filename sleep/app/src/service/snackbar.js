/**
 * Global snackbar messages
 * @author mtownsend
 * @since January 04, 2022
 * @flow
 **/

import React, { useContext, createContext, useState } from 'react';

const SnackContext = createContext<[?SnackMessage, ?SnackMessage => void]>([ null, () => {} ]);

export type SnackMessage = {|
  type: 'error' | 'warning' | 'info' | 'success',
  text: string
|};

type Props = {|
  children: React$Node
|};
export const SnackProvider = ({ children }: Props):React$Node => {
  const [ message, setMessage ] = useState<?SnackMessage>(null);
  return (
    <SnackContext.Provider value={[ message, setMessage ]}>
      {children}
    </SnackContext.Provider>
  );
};

export const useSnack = ():[?SnackMessage, ?SnackMessage => void] => useContext(SnackContext);