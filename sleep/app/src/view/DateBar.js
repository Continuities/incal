/**
 * UI for setting stay dates
 * @author mtownsend
 * @since December 30, 2021
 * @flow
 **/

import React from 'react';
import { useDates } from '@service/date';
import {
  AppBar,
  Stack,
  TextField
} from '@mui/material';
import {
  DatePicker,
  LocalizationProvider
} from '@mui/lab';
import AdapterDateFns from '@mui/lab/AdapterDateFns';

const PickerInput = props => (
  <TextField 
    variant='standard' 
    size='small' 
    {...props} 
  />
);

const DateBar = ():React$Node => {
  const [ dates, dispatch ] = useDates();
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <AppBar position='static' color='transparent' sx={{
        zIndex: 'appBar',
        height: 60,
        px: 2
      }}>
        <Stack 
          direction='row' 
          alignItems='center' 
          spacing={4}
          height={1}>
          <DatePicker
            label="Arrival"
            value={dates.start}
            onChange={val => dispatch({ type: 'set-start', data: val })}
            renderInput={PickerInput}
          />
          <DatePicker
            label="Departure"
            value={dates.end}
            onChange={val => dispatch({ type: 'set-end', data: val })}
            renderInput={PickerInput}
          />
        </Stack>
      </AppBar>
    </LocalizationProvider>
  );
};

export default DateBar;