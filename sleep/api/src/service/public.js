/**
 * Service for interacting with public storage
 * TODO: Move to shared/service
 * @author mtownsend
 * @since December 01, 2021
 * @flow
 **/
import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import { join } from 'path';
import type { ReadStream} from 'fs';

const streamToBuffer = (stream:ReadStream):Promise<Buffer> => 
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });

export const savePhoto = async (stream:ReadStream, format:string):Promise<string> => {
  const fileBuffer = await streamToBuffer(stream);
  const fileHash = createHash('md5');
  fileHash.update(fileBuffer);
  const filename = `${fileHash.digest('hex')}.${format}`;
  await fs.writeFile(join(String(process.env.PUBLIC_PATH), filename), fileBuffer);
  return filename;
};