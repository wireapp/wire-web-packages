/*
 * Wire
 * Copyright (C) 2018 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

import {APIClient} from '@wireapp/api-client';
import {GiphySearchOptions, GiphyMultipleResult, GiphyResult, GIPHY_RATING} from '@wireapp/api-client/dist/giphy/';

export class GiphyService {
  constructor(private readonly apiClient: APIClient) {}

  public getRandomGif(tag?: string, rating?: GIPHY_RATING): Promise<GiphyResult> {
    return this.apiClient.giphy.api.getGiphyRandom({rating, tag});
  }

  public getTrendingGif(rating?: GIPHY_RATING): Promise<GiphyMultipleResult> {
    return this.apiClient.giphy.api.getGiphyTrending({rating});
  }

  public searchGif(options: GiphySearchOptions): Promise<GiphyMultipleResult> {
    return this.apiClient.giphy.api.getGiphySearch(options);
  }
}
