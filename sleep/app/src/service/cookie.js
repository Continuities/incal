/**
 * Interacts with browser cookies
 * @author mtownsend
 * @since December 10, 2021
 * @flow
 **/

import { useEffect } from 'react';

export const setCookie = (key:string, value:string):void => 
  useEffect(() => {
    document.cookie = `${key}=${value}`
  }, [ key, value ]);