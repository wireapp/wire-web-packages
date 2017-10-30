import {AxiosRequestConfig, AxiosResponse} from 'axios';

import {HttpClient} from '../http/';
import {Image} from '../giphy/';

export default class GiphyAPI {
  constructor(private client: HttpClient) {}

  static get URL() {
    return {
      GIPHY: 'giphy/v1/gifs',
      PROXY: '/proxy',
      RANDOM: 'random',
    };
  }

  /**
   * Get a random GIF from Giphy.
   * @param tag GIF tag to limit randomness
   */
  public getGiphyRandom(tag: string): Promise<Image> {
    const config: AxiosRequestConfig = {
      data: {
        tag,
      },
      url: `${GiphyAPI.URL.PROXY}/${GiphyAPI.URL.GIPHY}/${GiphyAPI.URL.RANDOM}`,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }
}
