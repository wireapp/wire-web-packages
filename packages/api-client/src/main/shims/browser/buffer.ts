import * as SparkMD5 from 'spark-md5';

export const bufferToString = (buffer: ArrayBuffer): string => new TextDecoder('utf-8').decode(new Uint8Array(buffer));

export const base64MD5FromBuffer = (buffer: ArrayBuffer) => window.btoa(SparkMD5.ArrayBuffer.hash(buffer, true));

export const concatToBuffer = (...items: any[]) => new Blob(items);
