/**
 * Service for fetching/saving user info
 * @author mtownsend
 * @since October 05, 2021
 * @flow
 **/

import collection from './db.js';

export type User = {|
  email: string,
  firstname: string,
  lastname: string,
  sponsors: Array<string>,
  hash: string
|};

const COLLECTION = 'user';

export const getUser = async (email:string):Promise<?User> => {
  const users = await collection(COLLECTION);
  return users.findOne({ email });
};

export const saveUser = async (user:User):Promise<User> => {
  const users = await collection(COLLECTION);
  await users.insertOne(user);
  return user;
};