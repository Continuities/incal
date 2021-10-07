/**
 * Service for fetching/saving user info
 * @author mtownsend
 * @since October 05, 2021
 * @flow
 **/

import collection from './db.js';

export type UserStub = {|
  email: string,
  firstname: string,
  lastname: string
|}

export type User = {|
  ...UserStub,
  sponsors: Array<UserStub>,
  hash: string
|};

const COLLECTION = 'user';

export const getUser = async (email:string):Promise<?User> => {
  const users = await collection(COLLECTION);
  const user = await users.findOne({ email });
  if (!user) {
    return null;
  }
  user.sponsors = await Promise.all(user.sponsors.map(async s => {
    return await users.findOne({ email: s });
  }));
  return user;
};

export const saveUser = async (user:User):Promise<User> => {
  const users = await collection(COLLECTION);
  await users.insertOne(user);
  return user;
};

export const getUsers = async ():Promise<Array<User>> => {
  const col = await collection(COLLECTION);
  const users = await col.find();
  return users.toArray();
};

export const addSponsor = async (user:string, sponsor:string) => {
  const users = await collection(COLLECTION);
  await users.updateOne({ email: user }, { $push: { sponsors: sponsor }});
};

export const removeSponsor = async (user:string, sponsor:string) => {
  const users = await collection(COLLECTION);
  await users.updateOne({ email: user }, { $pull: { sponsors: sponsor }});
};