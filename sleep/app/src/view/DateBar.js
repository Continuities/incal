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
  TextField,
  Container
} from '@mui/material';
import {
  DatePicker,
  LocalizationProvider
} from '@mui/lab';
import { add } from 'date-fns';
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
        px: 2,
        justifyContent: 'center'
      }}>
        <Container maxWidth='sm'>
          <Stack 
            direction='row'
            spacing={4}
            height={1}
          >
            <DatePicker
              label="Arrival"
              value={dates.start}
              minDate={new Date()}
              onChange={val => dispatch({ type: 'set-start', data: val })}
              disableCloseOnSelect={false}
              renderInput={PickerInput}
            />
            <DatePicker
              label="Departure"
              value={dates.end}
              minDate={add(new Date(), { days: 1 })}
              onChange={val => dispatch({ type: 'set-end', data: val })}
              disableCloseOnSelect={false}
              renderInput={PickerInput}
            />
          </Stack>
        </Container>
      </AppBar>
    </LocalizationProvider>
  );
};

export default DateBar;