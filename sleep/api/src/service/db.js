/**
 * Interface layer for MongoDB
 * TODO: Move this to shared/service
 * @author mtownsend
 * @since October 07, 2021
 * @flow
 **/

import { MongoClient } from 'mongodb';

if (!process.env.DB_URI || !process.env.DB_NAME) {
  throw 'Database config not set';
}

const connect:Promise<any> = MongoClient.connect(process.env.DB_URI, {
  // Options
});

export default async (collection:string):Promise<any> => {
  const client = await connect;
  return client.db(process.env.DB_NAME).collection(collection);
};

const secrets = new Set([ 'hash', '_id' ]);
export const sanitise = (data:any):any =>
  Object.fromEntries(
    Object.entries(data)
      .filter(([ key, val ]) => !secrets.has(key)));
