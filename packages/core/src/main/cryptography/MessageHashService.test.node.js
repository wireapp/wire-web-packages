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

//@ts-check

/* eslint-disable no-magic-numbers */

const {MessageHashService} = require('@wireapp/core/dist/cryptography/');

fdescribe('MessageHashService', () => {
  describe('"getHash"', () => {
    it('correctly identifies the message type.', () => {
      const text = 'Hello!';

      const textMessage = {
        content: {text},
      };

      const messageHashService = new MessageHashService(textMessage);

      spyOn(messageHashService, 'getTextBuffer').and.callThrough();
      spyOn(messageHashService, 'getLocationBuffer').and.callThrough();

      messageHashService.getHash();

      expect(messageHashService.getTextBuffer).toHaveBeenCalled();
      expect(messageHashService.getLocationBuffer).not.toHaveBeenCalled();
    });
  });

  describe('"getTimestampBuffer"', () => {
    it('correctly creates a timestamp bytes buffer.', () => {
      const expectedByteArray = '000000005bcdcc09';
      const text = 'Hello!';
      const timestamp = 1540213769;

      const textMessage = {
        content: text,
        timestamp,
      };

      const messageHashService = new MessageHashService(textMessage);
      const buffer = messageHashService.getTimestampBuffer();

      const hexValue = buffer.toString('hex');
      expect(hexValue).toBe(expectedByteArray);
    });
  });

  describe('"getTextBuffer"', () => {
    it('correctly creates a markdown text bytes buffer.', () => {
      const expectedByteArray =
        'feff005400680069007300200068006100730020002a002a006d00610072006b0064006f0077006e002a002a000000005bcdcccd';
      const text = 'This has **markdown**';
      const timestamp = 1540213965;

      const textMessage = {
        content: {text},
        timestamp,
      };

      const messageHashService = new MessageHashService(textMessage);
      const buffer = messageHashService.getTextBuffer(textMessage.content);

      const hexValue = buffer.toString('hex');
      expect(hexValue).toBe(expectedByteArray);
    });

    it('correctly creates an arabic text bytes buffer.', () => {
      const expectedByteArray = 'feff0628063a062f0627062f000000005bcdcccd';
      const text = 'بغداد';
      const timestamp = 1540213965;

      const textMessage = {
        content: {text},
        timestamp,
      };

      const messageHashService = new MessageHashService(textMessage);
      const buffer = messageHashService.getTextBuffer(textMessage.content);

      const hexValue = buffer.toString('hex');
      expect(hexValue).toBe(expectedByteArray);
    });

    it('correctly creates an emoji text bytes buffer.', () => {
      const expectedByteArray =
        'feff00480065006c006c006f0020d83ddc69200dd83ddcbbd83ddc68200dd83ddc69200dd83ddc670021000000005bcdcc09';
      const text = 'Hello 👩‍💻👨‍👩‍👧!';
      const timestamp = 1540213769;

      const textMessage = {
        content: {text},
        timestamp,
      };

      const messageHashService = new MessageHashService(textMessage);
      const buffer = messageHashService.getTextBuffer(textMessage.content);

      const hexValue = buffer.toString('hex');
      expect(hexValue).toBe(expectedByteArray);
    });

    it('correctly creates a link text bytes buffer.', () => {
      const expectedByteArray =
        'feff00680074007400700073003a002f002f007700770077002e0079006f00750074007500620065002e0063006f006d002f00770061007400630068003f0076003d0044004c007a00780072007a004600430079004f0073000000005bcdcc09';
      const text = 'https://www.youtube.com/watch?v=DLzxrzFCyOs';
      const timestamp = 1540213769;

      const textMessage = {
        content: {text},
        timestamp,
      };

      const messageHashService = new MessageHashService(textMessage);
      const buffer = messageHashService.getTextBuffer(textMessage.content);

      const hexValue = buffer.toString('hex');
      expect(hexValue).toBe(expectedByteArray);
    });
  });

  describe('"getLocationBuffer"', () => {
    it('correctly creates a location bytes buffer.', () => {
      const expectedByteArray = '000000000000cd250000000000003458000000005bcdcc09';
      const timestamp = 1540213769;

      const location = {
        latitude: 52.5166667,
        longitude: 13.4,
      };

      const locationMessage = {
        content: location,
        timestamp,
      };

      const messageHashService = new MessageHashService(locationMessage);
      const buffer = messageHashService.getLocationBuffer(locationMessage.content);

      const hexValue = buffer.toString('hex');
      expect(hexValue).toBe(expectedByteArray);
    });

    it('correctly creates another location bytes buffer.', () => {
      const expectedByteArray = '000000000000c935ffffffffffffff8b000000005bcdcc09';
      const timestamp = 1540213769;

      const location = {
        latitude: 51.509143,
        longitude: -0.117277,
      };

      const locationMessage = {
        content: location,
        timestamp,
      };

      const messageHashService = new MessageHashService(locationMessage);
      const buffer = messageHashService.getLocationBuffer(locationMessage.content);

      const hexValue = buffer.toString('hex');
      expect(hexValue).toBe(expectedByteArray);
    });
  });

  xdescribe('"getAssetBuffer"', () => {
    it('correctly creates an asset bytes buffer.', () => {
      const expectedByteArray = '38d4f5b961a34228870637e75043dbaa000000005bcdcc09';
      const timestamp = 1540213769;

      const asset = {
        uploaded: {
          assetId: '38d4f5b9-61a3-4228-8706-37e75043dbaa',
        },
      };

      const assetMessage = {
        content: asset,
        timestamp,
      };

      const messageHashService = new MessageHashService(assetMessage);
      const buffer = messageHashService.getAssetBuffer(assetMessage.content);

      const hexValue = buffer.toString('hex');
      expect(hexValue).toBe(expectedByteArray);
    });

    it('correctly creates another asset bytes buffer.', () => {
      const expectedByteArray = '000000000000c935ffffffffffffff8b000000005bcdcc09';
      const timestamp = 1540213965;

      const asset = {
        uploaded: {
          assetId: '82a62735-35f2-4d4a-8190-284327979ca7',
        },
      };

      const assetMessage = {
        content: asset,
        timestamp,
      };

      const messageHashService = new MessageHashService(assetMessage);
      const buffer = messageHashService.getLocationBuffer(assetMessage.content);

      const hexValue = buffer.toString('hex');
      expect(hexValue).toBe(expectedByteArray);
    });
  });
});
