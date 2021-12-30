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
import type { ApiResponse } from '@authweb/service';

// TODO: Share type definitions with api
export type PlaceId = string;
export type Place = {|
  id: PlaceId,
  name: string,
  photo?: string,
  amenities: Array<Amenity>
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

export const usePlaces = ():[ ApiResponse<Array<Place>>, () => void] => {
  const [ refreshCode, setRefreshCode ] = useState(0);
  const places = api.useGet('/place', refreshCode);
  return [
    places,
    () => setRefreshCode(c => c + 1)
  ];
};

export const usePlace = (id:string):[ ApiResponse<Place>, () => void ] => {
  const [ refreshCode, setRefreshCode ] = useState(0);
  const place = api.useGet(`/place/${id}`, refreshCode);
  return [
    place,
    () => setRefreshCode(c => c + 1)
  ];
};

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