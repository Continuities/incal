/**
 * Basic local/sessionStorage interface
 * @author mtownsend
 * @since October 06, 2021
 * @flow
 **/

import React, { useState, useEffect } from 'react';

const parse = (s:?string) => !s ? null : JSON.parse(s);

export const useStorage = <T>(key:string, session:bool = false, defaultValue:?T = null):[ ?T, T => void, () => void ] => {
  const storage = session ? sessionStorage : localStorage;
  const [ val, setVal ] = useState(storage.getItem(key));

  const setItem = newVal => {
    const s = JSON.stringify(newVal);
    storage.setItem(key, s);
    setVal(s);
  };

  const removeItem = () => {
    storage.removeItem(key);
    setVal(null);
  };

  useEffect(() => {
    if (!val && defaultValue) {
      setItem(defaultValue);
    }
  }, [])

  return [
    parse(val),
    setItem,
    removeItem
  ];
}

