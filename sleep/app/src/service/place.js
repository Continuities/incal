/**
 * Talk to the server about Places
 * @author mtownsend
 * @since December 29, 2021
 * @flow
 **/

import React, { useState } from 'react';
import { api } from '@authweb/service';
import {
  Hotel, Fireplace
} from '@mui/icons-material';
import { useDates, areDatesValid } from '@service/date';
import { useUser } from '@service/user';
import { areIntervalsOverlapping } from 'date-fns';
import { useSnack } from '@service/snackbar';

import type { StayDates } from '@service/date';
import type { ApiResponse } from '@authweb/service';

// TODO: Share type definitions with api
export type PlaceId = string;
export type Place = {|
  id: PlaceId,
  name: string,
  photo?: string,
  amenities: Array<Amenity>,
  bookings: Array<Booking>
|};

export type Booking = {|
  start: Date,
  end: Date,
  status: 'pending' | 'approved' | 'denied',
  guestId: string
|};


export type AmenityType = 
  'sleeps' | 
  'heated';

export type AmenityDefinition = {|
  label: string,
  Icon: React$ComponentType<any>,
  value?:string
|};

export type Amenity = {|
  type: AmenityType,
  value?: any
|};

const parse = (json:any):Place => ({
  ...json,
  bookings: json.bookings ? json.bookings.map(b => ({
    ...b,
    start: new Date(b.start),
    end: new Date(b.end)
  })) : []
});

export const usePlaces = ():[ ApiResponse<Array<Place>>, () => void] => {
  const [ refreshCode, setRefreshCode ] = useState(0);
  const places = api.useGet('/place', refreshCode);
  return [
    api.mapResponse(places, list => list.map(parse)),
    () => setRefreshCode(c => c + 1)
  ];
};

export const usePlace = (id:string):[ ApiResponse<Place>, () => void ] => {
  const [ refreshCode, setRefreshCode ] = useState(0);
  const place = api.useGet(`/place/${id}`, refreshCode);
  return [
    api.mapResponse(place, parse),
    () => setRefreshCode(c => c + 1)
  ];
};

export const useReserve = (placeId: PlaceId, onComplete?:() => void):() => Promise<void> => {
  const Api = api.useApi();
  const [ , setSnack ] = useSnack();
  const [ dates ] = useDates();
  const [ user ] = useUser();

  return async () => {

    if (!user || !areDatesValid(dates)) {
      return;
    }

    const booking:Booking = {
      start: dates.start || new Date(),
      end: dates.end || new Date(),
      guestId: user.email,
      status: 'pending'
    };
    const response = await Api.doPost(`/place/${placeId}/booking`, null, JSON.stringify(booking));
    
    if (response.status === 'error') {
      setSnack({ type: 'error', text: response.description });
    }
    else if (response.status === 'success') {
      const { status } = response.result;
      setSnack({
        type: status === 'approved' ? 'success' : 'info',
        text: status === 'approved' ? 'Reservation complete. See you soon!' : 'Your reservation is pending approval.'
      });
    }

    onComplete && onComplete();
  };
}

export const Amenities:Map<AmenityType, AmenityDefinition> = new Map([
  [ 'sleeps', { 
    label: 'sleeps', 
    Icon: Hotel,
    value: 'number'
  } ],
  [ 'heated', { 
    label: 'heated', 
    Icon: Fireplace
  }]
]);

export const isAvailable = (place:Place, dates:StayDates):boolean => {
  for (const booking of place.bookings) {
    if (areIntervalsOverlapping({
      start: booking.start,
      end: booking.end
    }, {
      start: dates.start,
      end: dates.end
    })) {
      return false;
    }
  }
  return true;
};