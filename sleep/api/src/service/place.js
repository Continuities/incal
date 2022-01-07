/**
 * Manages logic related to places
 * @author mtownsend
 * @since December 29, 2021
 * @flow
 **/
import { v4 as uuid } from 'uuid';
import collection, { sanitise } from './db.js';
import { parse, evaluate } from './rule.js';

import type { Tagged } from '../util.js';
import type { RuleDefinition } from './rule.js';

// TODO: Share type definitions with app
export type PlaceId = string;
export type Place = {|
  id: PlaceId,
  owner: string,
  name: string,
  photo?: string,
  amenities: Array<Amenity>,
  bookings: Array<Booking>,
  rules: Array<RuleDefinition>
|};

export type AmenityType = 'sleeps' | 'heated';

export type Amenity = {|
  type: AmenityType,
  value?: any
|};

export type BookingId = string;

export type Booking = {|
  id: BookingId,
  start:Date,
  end:Date,
  status: 'pending' | 'approved' | 'denied',
  guestId: string
|};

const COLLECTION = 'place';

const canBook = (place:Tagged<Place>, user:?Tagged<any>) => {
  if (!user) { return false; }
  return evaluate(parse(place.rules || []), user, place);
};

const withTags = (place:Place, user?:any):Tagged<Place> => ({
  ...place,
  tags: [
    user?.email === place.owner ? 'editable' : null
  ].filter(Boolean)
});

export const getPlaces = async (user?:any):Promise<Array<Tagged<Place>>> => {
  const col = await collection(COLLECTION);
  const places = await col.find();
  return (await places.toArray())
    .map(sanitise)
    .map(p => withTags(p, user))
    .filter(p => canBook(p, user));
};

export const getBookings = async (userEmail:string, user?:any): Promise<Array<Tagged<Place>>> => {
  const col = await collection(COLLECTION);
  const places = await col.find({ "bookings.guestId": userEmail });
  return (await places.toArray())
    .map(sanitise)
    .map(p => withTags(p, user));
};

export const getPlace = async (id:PlaceId, user?:any):Promise<?Tagged<Place>> => {
  const col = await collection(COLLECTION);
  const place = await col.findOne({ id });
  return !place ? null : withTags(place, user);
};

export const reservePlace = async (placeId:PlaceId, booking:Booking):Promise<Booking> => {
  const col = await collection(COLLECTION);
  // TODO: Validate the reservation
  booking.id = uuid();
  if (!requiresApproval(placeId, booking)) {
    booking.status = 'approved';
  }
  await col.updateOne({ id: placeId }, { $push: { bookings: booking }});
  return booking;
};

export const cancelReservation = async (placeId:PlaceId, bookingId:BookingId):Promise<void> => {
  const col = await collection(COLLECTION);
  await col.updateOne({ id: placeId }, { $pull: { bookings: { id: bookingId }}});
};

export const createPlace = async (input: any):Promise<Tagged<Place>> => {
  
  if (!input.name) {
    throw 'Invalid name';
  }

  const col = await collection(COLLECTION);
  const place = {
    id: uuid(),
    owner: input.owner,
    photo: input.photo,
    name: input.name,
    amenities: input.amenities || [],
    rules: input.rules || [],
    bookings: []
  };
  await col.insertOne(place);

  return withTags(place)
};

export const updatePlace = async (placeId:string, data:Place):Promise<Place> => {
  const col = await collection(COLLECTION);
  const val = {
    ...data,
    id: placeId
  };
  await col.updateOne({ id: placeId }, { $set: val });
  return val;
};

export const deletePlace = async (placeId:string):Promise<void> => {
  const col = await collection(COLLECTION);
  await col.deleteOne({ id: placeId });
}

export const requiresApproval = (placeId:PlaceId, booking:Booking):boolean => {
  // TODO: implement booking approval
  return false;
};