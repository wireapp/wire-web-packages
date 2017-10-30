import {createHash} from 'crypto';

export const bufferToString = (buffer: ArrayBuffer): string => Buffer.from(buffer).toString('utf8');

export const base64MD5FromBuffer = (buffer: ArrayBuffer): string => {
  return createHash('md5')
    .update(Buffer.from(buffer))
    .digest('base64');
};

export const concatToBuffer = (...items: any[]) => Buffer.concat(items.map(item => Buffer.from(item)));
