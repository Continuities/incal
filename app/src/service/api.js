/**
 * Interface for the public API
 * @author mtownsend
 * @since October 07, 2021
 * @flow
 **/

import React, { useState, useEffect } from 'react';
import {
  Grid,
  CircularProgress
} from '@mui/material';
import { useToken } from '@service/auth';

import type { Token } from '@service/auth';

const API = process.env.API_URI || '';

export type ApiStatus = 
  'success' | 
  'success_empty' | 
  'error' | 
  'pending';

export type ApiSuccessEmpty = {|
  status: 'success_empty'
|};

export type ApiSuccess<T> = {|
  status: 'success',
  result: T
|};

export type ApiError = {|
  status: 'error',
  code: number,
  description: string
|};

export type ApiPending = {|
  status: 'pending'
|};

export type ApiResponse<T> = 
  ApiSuccess<T> | 
  ApiSuccessEmpty |
  ApiError |
  ApiPending;

export type UserAction = 
  'sponsor' | 
  'request_sponsor' |
  'remove_sponsor' |
  'add_anchor' |
  'remove_anchor';

export type UserTag =
  'anchor' |
  'orphan';

export type UserStub = {|
  email: string,
  firstname: string,
  lastname: string,
  tags: Array<UserTag>
|};

export type User = {|
  ...UserStub,
  sponsors: Array<UserStub>,
  actions: Array<UserAction>
|};

const doFetch = async <T> (query, method, token, signal): Promise<ApiResponse<T>> => {
  const headers:any = {
    Accept: 'application/json'
  };

  if (token) {
    headers.Authorization = `${token.token_type} ${token.access_token}`;
  }
  const sep = API.endsWith('/') || query.startsWith('/') ? '' : '/';
  const response = await fetch(`${API}${sep}${query}`, { 
    method,
    signal, 
    headers 
  });
  if (!response.ok) {
    return {
      status: 'error',
      code: response.status,
      description: response.statusText
    };
  }
  if (response.status === 204) {
    return {
      status: 'success_empty'
    };
  }
  return {
    status: 'success',
    result: await response.json()
  };
};

export const doGet = async <T> (query:string, token?:?Token, signal?:AbortSignal): Promise<ApiResponse<T>> => 
  doFetch(query, 'GET', token, signal);
export const doPut = async <T> (query:string, token?:?Token, signal?:AbortSignal): Promise<ApiResponse<T>> => 
  doFetch(query, 'PUT', token, signal);
export const doDelete = async <T> (query:string, token:?Token, signal?:AbortSignal): Promise<ApiResponse<T>> => 
  doFetch(query, 'DELETE', token, signal);

type ResolverProps<T> = {|
  children: T => React$Node,
  data: any
|};

export const ApiResolver = <T>({ children, data }: ResolverProps<T>):React$Node => {
  if (data.hasOwnProperty('status')) {
    switch (data.status) {
      case 'success':
        return children(data.result);
      case 'pending':
        return (
          <Grid container sx={{
            height: 1,
            width: 1,
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CircularProgress />
          </Grid>
        );
      case 'error':
        return (
          <Grid container sx={{
            height: 1,
            width: 1,
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {data.description}
          </Grid>
        );
    }
  }
  return children(data);
};

export const useGet = <T> (query:string, resend:number = 0):ApiResponse<T> => {
  const [ response, setResponse ] = useState({ status: 'pending' });
  const [ token, refreshToken ] = useToken();

  useEffect(() => {
    if (response.status !== 'error' || response.code !== 401) { return; }
    // Try to refresh expired tokens
    refreshToken();
  }, [ response.status ])

  useEffect(() => {
    const controller = new AbortController();
    doGet(query, token, controller.signal)
      .then(setResponse)
      .catch(() => { /* Ignore obsolete requests */ });
    return () => controller.abort();
  }, [ resend, query, token ]);

  return response;
};
