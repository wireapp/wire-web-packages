import {AxiosResponse} from 'axios';
import {HttpClient} from '../http';
import {isValidKey, isValidToken} from './AssetUtil';
import {unsafeAlphanumeric} from '../shims/node/random';
import AssetRetentionPolicy from './AssetRetentionPolicy';
import AssetUploadData from './AssetUploadData';
import {base64MD5FromBuffer, concatToBuffer} from '../shims/node/buffer';

export default class AssetAPI {
  private static ASSET_URL = '/assets/v3';

  constructor(private client: HttpClient) {}

  getAsset(key: string, token?: string): Promise<ArrayBuffer> {
    if (!isValidKey(key)) {
      throw TypeError('Expected key to only contain alphanumeric values and dashes.');
    }

    if (token && !isValidToken(token)) {
      throw TypeError('Expected token to be base64 encoded string.');
    }

    return this.client
      .sendRequest(
        {
          method: 'get',
          url: `${AssetAPI.ASSET_URL}/${key}`,
          responseType: 'arraybuffer',
          params: {
            asset_token: token,
          },
        },
        true,
      )
      .then((response: AxiosResponse) => response.data);
  }

  postAsset(asset: Uint8Array, options: {public: boolean; retention: AssetRetentionPolicy}): Promise<AssetUploadData> {
    const BOUNDARY = `Frontier${unsafeAlphanumeric()}`;

    const metadata = JSON.stringify(
      Object.assign(
        {
          public: true,
          retention: AssetRetentionPolicy.PERSISTENT,
        },
        options,
      ),
    );

    let body = '';

    body += `--${BOUNDARY}\r\n`;
    body += 'Content-Type: application/json;charset=utf-8\r\n';
    body += `Content-length: ${metadata.length}\r\n`;
    body += '\r\n';
    body += `${metadata}\r\n`;

    body += `--${BOUNDARY}\r\n`;
    body += 'Content-Type: application/octet-stream\r\n';
    body += `Content-length: ${asset.length}\r\n`;
    body += `Content-MD5: ${base64MD5FromBuffer(asset.buffer)}\r\n`;
    body += '\r\n';

    const footer = `\r\n--${BOUNDARY}--\r\n`;

    return this.client
      .sendRequest({
        method: 'post',
        url: AssetAPI.ASSET_URL,
        headers: {
          'Content-Type': `multipart/mixed; boundary=${BOUNDARY}`,
        },
        data: concatToBuffer(body, asset, footer),
      })
      .then((response: AxiosResponse) => response.data);
  }
}
