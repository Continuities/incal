/**
 * Date logic
 * @author mtownsend
 * @since December 30, 2021
 * @flow
 **/

import React, { useContext, createContext, useReducer } from 'react';

export type StayDates = {|
  start: ?Date,
  end: ?Date
|};

export type DateAction = {|
  type: 'set-start',
  data: Date
|} | {|
  type: 'set-end',
  data: Date
|} | {|
  type: 'clear'
|};

const EMPTY:StayDates = { start: null, end: null };

const withoutTime = (date:Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const dateReducer = (state, action) => {
  switch (action.type) {
    case 'set-start':
      const start = withoutTime(action.data);
      return {
        start,
        end: state.end && state.end > start ? state.end : null
      };
    case 'set-end':
      const end = withoutTime(action.data);
      return {
        start: state.start && state.start < end? state.start : null,
        end
      };
    case 'clear':
      return { start: null, end: null };
  }
};

const DateContext = createContext<[StayDates, DateAction => void]>([ EMPTY, () => {} ]);

type ProviderProps = {|
  children: React$Node
|};

export const DateProvider = ({ children }: ProviderProps):React$Node => {
  const [ dates, dispatch ] = useReducer<StayDates, DateAction>(dateReducer, EMPTY);
  return (
    <DateContext.Provider value={[ dates, dispatch ]}>
      {children}
    </DateContext.Provider>
  );
};

export const useDates = ():[ StayDates, DateAction => void ] => useContext(DateContext);