/**
 * Manages logic related to places
 * @author mtownsend
 * @since December 29, 2021
 * @flow
 **/
import { v4 as uuid } from 'uuid';
import collection, { sanitise } from './db.js';

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

type Tagged<T> = {|
  ...T,
  tags: Array<string>
|};

const COLLECTION = 'place';

const withTags = (place:Place):Tagged<Place> => ({
  ...place,
  tags: [] // TODO
});

export const getPlaces = async ():Promise<Array<Tagged<Place>>> => {
  const col = await collection(COLLECTION);
  const places = await col.find();
  return (await places.toArray())
    .map(sanitise)
    .map(withTags);
};

export const getPlace = async (id:PlaceId):Promise<?Tagged<Place>> => {
  const col = await collection(COLLECTION);
  const place = await col.findOne({ id });
  return !place ? null : withTags(place);
};

export const createPlace = async (name: string):Promise<Tagged<Place>> => {
  
  if (!name) {
    throw 'Invalid name';
  }

  const col = await collection(COLLECTION);
  const place = {
    id: uuid(),
    name,
    amenities: []
  };
  col.insert(place);

  return withTags(place)

};