/**
 * Interface for the public API
 * @author mtownsend
 * @since October 07, 2021
 * @flow
 **/

import React, { useState, useEffect } from 'react';
import { useToken } from '@service/auth';

const API = process.env.API_URI || '';

export type ApiStatus = 'success' | 'error' | 'pending';

export type ApiSuccess<T> = {|
  status: 'success',
  result: T
|};

export type ApiError = {|
  status: 'error',
  error: string
|};

export type ApiPending = {|
  status: 'pending'
|};

export type ApiResponse<T> = 
  ApiSuccess<T> | 
  ApiError |
  ApiPending;

const doGet = async <T> (query, token, signal): Promise<ApiResponse<T>> => {
  const headers:any = {
    Accept: 'application/json'
  };

  if (token) {
    headers.Authorization = `${token.token_type} ${token.access_token}`;
  }

  const response = await fetch(`${API}/${query}`, { signal, headers });
  if (!response.ok) {
    return {
      status: 'error',
      error: response.statusText
    };
  }
  return {
    status: 'success',
    result: await response.json()
  };
};

export const useGet = <T> (query:string):ApiResponse<T> => {
  const [ response, setResponse ] = useState({ status: 'pending' });
  const [ token ] = useToken();
  useEffect(() => {
    const controller = new AbortController();
    doGet(query, token, controller.signal).then(setResponse);
    return () => controller.abort();
  }, [ query, token ]);

  return response;
};
