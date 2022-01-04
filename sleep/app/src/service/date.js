/**
 * Date logic
 * @author mtownsend
 * @since December 30, 2021
 * @flow
 **/

import React, { useContext, createContext, useReducer } from 'react';
import {
  isFuture,
  isAfter,
  add,
  sub
} from 'date-fns';

export type StayDates = {|
  start: Date,
  end: Date
|};

export type DateAction = {|
  type: 'set-start',
  data: Date
|} | {|
  type: 'set-end',
  data: Date
|};

const newDates = ():StayDates => ({
  start: add(new Date(), { days: 1 }),
  end: add(new Date(), { days: 2 })
})

const withoutTime = (date:Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const dateReducer = (state, action) => {
  switch (action.type) {
    case 'set-start':
      const start = withoutTime(action.data);
      return {
        start,
        end: state.end && state.end > start ? state.end : add(start, { days: 1 })
      };
    case 'set-end':
      const end = withoutTime(action.data);
      return {
        start: state.start && state.start < end? state.start : sub(end, { days: 1 }),
        end
      };
  }
};

const DateContext = createContext<[StayDates, DateAction => void]>([ newDates(), () => {} ]);

type ProviderProps = {|
  children: React$Node
|};

export const DateProvider = ({ children }: ProviderProps):React$Node => {
  const [ dates, dispatch ] = useReducer<StayDates, DateAction>(dateReducer, newDates());
  return (
    <DateContext.Provider value={[ dates, dispatch ]}>
      {children}
    </DateContext.Provider>
  );
};

export const useDates = ():[ StayDates, DateAction => void ] => useContext(DateContext);

export const areDatesValid = (dates:StayDates):boolean => {
  const { start, end } = dates;
  if (!start || !end) {
    return false;
  }
  if (!isFuture(start)) {
    return false;
  }
  if (!isAfter(end, start)) {
    return false;
  }
  return true;
};