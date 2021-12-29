/**
 * Manages logic related to places
 * @author mtownsend
 * @since December 29, 2021
 * @flow
 **/

// TODO: Share type definitions with app
export type PlaceId = string;
export type Place = {|
  id: PlaceId,
  name: string,
  photo?: string,
  amenities: Array<Amenity>
|};

export type Amenity = {|
  type: 'sleeps',
  value: number
|} | {|
  type: 'heated',
  value: boolean
|};

const FAKE_PLACES = {
  'PLACE1': {
    id: 'PLACE1',
    name: 'A Hole In The Ground',
    amenities: [{ type: 'sleeps', value: 2 }]
  },
  'PLACE2': {
    id: 'PLACE2',
    name: 'Literally A Tree',
    amenities: [{ type: 'sleeps', value: 4 }]
  },
  'PLACE3': {
    id: 'PLACE3',
    name: 'The Space Under The Stove',
    amenities: [
      { type: 'sleeps', value: 1 },
      { type: 'heated', value: true }
    ]
  }
};

export const getPlaces = async ():Promise<Array<Place>> => {
  // $FlowFixMe TODO
  return [...Object.values(FAKE_PLACES)];
};

export const getPlace = async (id:PlaceId):Promise<?Place> => {
  // TODO
  return FAKE_PLACES[id];
};