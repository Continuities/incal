/**
 * Basic local/sessionStorage interface
 * @author mtownsend
 * @since October 06, 2021
 * @flow
 **/

import React, { useState, useEffect, useMemo } from 'react';

export const useStorage = <T>(key:string, session:bool = false, defaultValue:?T = null):[ ?T, T => void, () => void ] => {
  const storage = session ? sessionStorage : localStorage;
  const [ val, setVal ] = useState(storage.getItem(key));
  const data = useMemo(() => !val ? null : JSON.parse(val), [ val ]);

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
    data,
    setItem,
    removeItem
  ];
}

