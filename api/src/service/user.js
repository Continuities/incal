/**
 * Service for fetching/saving user info
 * @author mtownsend
 * @since October 05, 2021
 * @flow
 **/

import collection, { sanitise } from './db.js';
import { promises as fs } from 'fs';
import { createHash } from 'crypto';
import { join } from 'path';

import type { ReadStream } from 'fs';

export type UserTag = 
  'anchor' |
  'orphan' |
  'invite-pending';

export type UserStub = {|
  email: string,
  firstname: string,
  lastname: string,
  tags: Array<UserTag>
|}

export type User = {|
  ...UserStub,
  photo: ?string,
  sponsors: Array<UserStub>,
  sponsees: Array<UserStub>,
  hash: string
|};

const COLLECTION = 'user';

const toStub = user => ({
  email: user.email,
  firstname: user.firstname,
  lastname: user.lastname,
  tags: user.tags
});

const withTags = user => {
  const tags = [];
  user.isAnchor && tags.push('anchor');
  !user.isAnchor && user.sponsors.length === 0 && tags.push('orphan');
  !user.hash && tags.push('invite-pending');
  return {
    ...user,
    tags
  };
}

export const getUser = async (email:string):Promise<?User> => {
  const users = await collection(COLLECTION);
  const user = await users.findOne({ email });
  if (!user) {
    return null;
  }
  user.sponsors = await Promise.all(user.sponsors.map(async s => {
    return sanitise(withTags(await users.findOne({ email: s })));
  }));
  user.sponsees = (await getSponsees(email))
    .map(sanitise)
    .map(toStub);
  return withTags(user);
};

export const saveUser = async (user:any):Promise<User> => {
  const users = await collection(COLLECTION);
  await users.insertOne(user);
  return withTags(user);
};

export const upgradeUser = async (email:string, firstname:string, lastname: string, hash:string):Promise<void> => {
  const users = await collection(COLLECTION);
  await users.updateOne({ email }, { $set: { firstname, lastname, hash }});
};

export const removeUser = async (email:string):Promise<void> => {
  const users = await collection(COLLECTION);
  await users.deleteOne({ email });
}

export const getUsers = async ():Promise<Array<User>> => {
  const col = await collection(COLLECTION);
  const users = await col.find();
  return (await users.toArray()).map(withTags);
};

export const addSponsor = async (user:string, sponsor:string) => {
  const users = await collection(COLLECTION);
  await users.updateOne({ email: user }, { $push: { sponsors: sponsor }});
};

export const removeSponsor = async (user:string, sponsor:string) => {
  const users = await collection(COLLECTION);
  await users.updateOne({ email: user }, { $pull: { sponsors: sponsor }});
};

export const getSponsees = async (email:string):Promise<Array<User>> => {
  const users = await collection(COLLECTION);
  const sponsees = await users.find({ sponsors: email });
  return (await sponsees.toArray()).map(withTags);
};

export const getAnchors = async ():Promise<Array<UserStub>> => {
  const users = await collection(COLLECTION);
  const anchors = await users.find({ isAnchor: true });
  return (await anchors.toArray()).map(withTags).map(toStub);
};

export const addAnchor = async (email:string) => {
  const users = await collection(COLLECTION);
  await users.updateOne({ email }, { $set: { isAnchor: true, sponsors: [] }});
};

export const removeAnchor = async (email:string) => {
  const users = await collection(COLLECTION);
  await users.updateOne({ email }, { $set: { isAnchor: false }});
};

export const setPhoto = async (user:string, stream:ReadStream, format:string):Promise<string> => {
  const users = await collection(COLLECTION);
  const fileBuffer = await streamToBuffer(stream);
  const fileHash = createHash('md5');
  fileHash.update(fileBuffer);
  const filename = `${fileHash.digest('hex')}.${format}`;
  await fs.writeFile(join('public', filename), fileBuffer);
  await users.updateOne({ email: user }, { $set: { photo: filename }});
  return filename;
}

export const refreshUserMiddleware = async (req:any, res:any, next:any) => {
  const { user } = req.session;
  if (user) {
    req.session.user = await getUser(user.email);
  }
  next();
}

const streamToBuffer = (stream:ReadStream):Promise<Buffer> => 
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });