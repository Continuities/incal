/**
 * Interface for the public API
 * @author mtownsend
 * @since October 07, 2021
 * @flow
 **/

import React, { 
  useState, 
  useEffect,
  createContext,
  useContext
} from 'react';
import {
  Grid,
  CircularProgress
} from '@mui/material';
import { useToken } from './auth';

import type { Token } from './auth';

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
  'remove_anchor' |
  'invite_sponsee';

export type UserTag =
  'anchor' |
  'orphan';

export type UserStub = {|
  email: string,
  firstname?: string,
  lastname?: string,
  photo?: string,
  tags: Array<UserTag>
|};

export type User = {|
  ...UserStub,
  sponsors: Array<UserStub>,
  sponsees: Array<UserStub>,
  actions: Array<UserAction>
|};

type ApiFunction = <T> (string, ?Token, ?AbortSignal) => Promise<ApiResponse<T>>

type FetchParams = {|
  query: string,
  method: 'GET' | 'PUT' | 'DELETE' | 'POST',
  token: ?Token,
  body?:any,
  signal:AbortSignal
|}

type ApiType = {|
  doFetch: <T> (FetchParams) => Promise<ApiResponse<T>>,
  doGet: ApiFunction,
  doPost: <T> (string, ?Token, ?any, ?AbortSignal) => Promise<ApiResponse<T>>,
  doPut: <T> (string, ?Token, ?any, ?AbortSignal) => Promise<ApiResponse<T>>,
  doDelete: ApiFunction
|};

const Api = (apiUri:string):ApiType => ({

  doFetch: async <T> ({ query, method, token, body = null, signal }): Promise<ApiResponse<T>> => {
    const headers:any = {
      Accept: 'application/json'
    };

    if (method === 'POST') {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers.Authorization = `${token.token_type} ${token.access_token}`;
    }
    const request:any = {
      method,
      signal,
      headers
    };
    if (body) {
      request.body = body;
    }
    const sep = apiUri.endsWith('/') || query.startsWith('/') ? '' : '/';
    const response = await fetch(`${apiUri}${sep}${query}`, request);
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
  },

  doGet: async function<T> (query:string, token?:?Token, signal?:?AbortSignal): Promise<ApiResponse<T>> { 
    return this.doFetch({ query, method: 'GET', token, signal })
  },
  doPost: async function<T> (query:string, token?:?Token, body?:any, signal?:?AbortSignal): Promise<ApiResponse<T>> {
    return this.doFetch({ query, method: 'POST', token, body, signal });
  },
  doPut: async function<T> (query:string, token?:?Token, body?:any, signal?:?AbortSignal): Promise<ApiResponse<T>> {
    return this.doFetch({ query, method: 'PUT', token, body, signal });
  },
  doDelete: async function<T> (query:string, token?:?Token, signal?:?AbortSignal): Promise<ApiResponse<T>> {
    return this.doFetch({ query, method: 'DELETE', token, signal });
  }
});

export const mapResponse  = <T, R> (response:ApiResponse<T>, mapper:T => R):ApiResponse<R> => {
  switch (response.status) {
    case 'success':
      return { status: 'success', result: mapper(response.result) };
    case 'error':
      return { status: 'error', code: response.code, description: response.description };
    case 'pending':
      return { status: 'pending' };
    case 'success_empty':
      return { status: 'success_empty' }; 
  }
};

type ResolverProps<T> = {|
  children: T => React$Node,
  data: any,
  error?: ApiError => React$Node
|};

export const ApiResolver = <T>({ children, error, data }: ResolverProps<T>):React$Node => {
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
        if (error) {
          return error(data);
        }
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


const ApiContext = createContext<any>(null);
type ApiProps = {|
  uri: string,
  children: React$Node
|};
export const ApiProvider = ({ uri, children }: ApiProps):React$Node => {
  const [ api, setApi ] = useState(() => Api(uri));
  return (
    <ApiContext.Provider value={api}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = ():ApiType => useContext(ApiContext);

export const useGet = <T> (query:string, resend:number = 0):ApiResponse<T> => {
  const [ response, setResponse ] = useState({ status: 'pending' });
  const api = useContext(ApiContext);
  if (!api) {
    throw 'Cannot useGet outside of ApiProvider';
  }
  const { token, refreshToken } = useToken();

  useEffect(() => {
    if (response.status !== 'error' || response.code !== 401) { return; }
    // Try to refresh expired tokens
    refreshToken();
  }, [ response.status ])

  useEffect(() => {
    const controller = new AbortController();
    api.doGet(query, token, controller.signal)
      .then(setResponse)
      .catch(() => { /* Ignore obsolete requests */ });
    return () => controller.abort();
  }, [ resend, query, token ]);

  return response;
};
