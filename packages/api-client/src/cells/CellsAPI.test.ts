/*
 * Wire
 * Copyright (C) 2025 Wire Swiss GmbH
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

import {AxiosResponse} from 'axios';
import {NodeServiceApi, RestNode, RestNodeCollection} from 'cells-sdk-ts';
import {v4 as uuidv4} from 'uuid';

import {CellsAPI} from './CellsAPI';
import {CellsStorageService} from './CellStorageService/CellStorageService';
import {S3Service} from './CellStorageService/S3Service';

import {HttpClient} from '../http';

jest.mock('cells-sdk-ts');
jest.mock('uuid');
jest.mock('./CellsStorage/S3Service');

describe('CellsAPI', () => {
  let cellsAPI: CellsAPI;
  let mockHttpClient: jest.Mocked<HttpClient>;
  let mockStorageService: jest.Mocked<CellsStorageService>;
  let mockNodeServiceApi: jest.Mocked<NodeServiceApi>;
  let testFile: File;

  beforeEach(() => {
    jest.clearAllMocks();

    (uuidv4 as jest.Mock).mockReturnValue(MOCKED_UUID);

    mockHttpClient = {
      config: {
        cells: {
          s3: {
            apiKey: 'test-api-key',
            bucket: 'test-bucket',
            endpoint: 'test-endpoint',
            region: 'test-region',
          },
        },
      },
      client: {},
    } as unknown as jest.Mocked<HttpClient>;

    mockStorageService = {
      putObject: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<CellsStorageService>;

    mockNodeServiceApi = {
      createCheck: jest.fn(),
      getByUuid: jest.fn(),
      lookup: jest.fn(),
      performAction: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<NodeServiceApi>;

    (NodeServiceApi as jest.Mock).mockImplementation(() => mockNodeServiceApi);

    testFile = new File([TEST_FILE_CONTENT], TEST_FILE_NAME, {type: TEST_FILE_TYPE}) as File;

    cellsAPI = new CellsAPI(mockHttpClient, mockStorageService);
  });

  it('initializes with provided storage service and creates NodeServiceApi', () => {
    expect(NodeServiceApi).toHaveBeenCalledWith(undefined, undefined, mockHttpClient.client);
  });

  it('creates a default S3Service if none is provided', () => {
    (S3Service as jest.Mock).mockClear();

    new CellsAPI(mockHttpClient);

    expect(S3Service).toHaveBeenCalledTimes(1);
    expect(S3Service).toHaveBeenCalledWith(mockHttpClient.config.cells!.s3);
  });

  it('throws error when cells configuration is missing', () => {
    const httpClientWithoutConfig = {
      config: {},
      client: {},
    } as unknown as HttpClient;

    expect(() => new CellsAPI(httpClientWithoutConfig)).toThrow();
  });

  describe('uploadFile', () => {
    it('normalizes file paths and uploads with correct metadata', async () => {
      mockNodeServiceApi.createCheck.mockResolvedValueOnce(
        createMockResponse({
          Results: [
            {
              Exists: false,
            },
          ],
        }),
      );

      await cellsAPI.uploadFile({filePath: TEST_FILE_PATH, file: testFile});

      expect(mockNodeServiceApi.createCheck).toHaveBeenCalledWith({
        Inputs: [{Type: 'LEAF', Locator: {Path: `/${TEST_FILE_PATH}`}}],
        FindAvailablePath: true,
      });

      expect(mockStorageService.putObject).toHaveBeenCalledWith({
        filePath: `/${TEST_FILE_PATH}`,
        file: testFile,
        metadata: {
          'Draft-Mode': 'true',
          'Create-Resource-Uuid': MOCKED_UUID,
          'Create-Version-Id': MOCKED_UUID,
        },
      });
    });

    it('uses auto-renaming when file exists and autoRename is true', async () => {
      const nextPath = `/folder/test (1).txt`;

      mockNodeServiceApi.createCheck.mockResolvedValueOnce(
        createMockResponse({
          Results: [
            {
              Exists: true,
              NextPath: nextPath,
            },
          ],
        }),
      );

      await cellsAPI.uploadFile({filePath: TEST_FILE_PATH, file: testFile});

      expect(mockStorageService.putObject).toHaveBeenCalledWith({
        filePath: nextPath,
        file: testFile,
        metadata: {
          'Draft-Mode': 'true',
          'Create-Resource-Uuid': MOCKED_UUID,
          'Create-Version-Id': MOCKED_UUID,
        },
      });
    });

    it('keeps original path when autoRename is false', async () => {
      const nextPath = `/folder/test (1).txt`;

      mockNodeServiceApi.createCheck.mockResolvedValueOnce(
        createMockResponse({
          Results: [
            {
              Exists: true,
              NextPath: nextPath,
            },
          ],
        }),
      );

      await cellsAPI.uploadFile({filePath: TEST_FILE_PATH, file: testFile, autoRename: false});

      expect(mockStorageService.putObject).toHaveBeenCalledWith({
        filePath: `/${TEST_FILE_PATH}`,
        file: testFile,
        metadata: {
          'Draft-Mode': 'true',
          'Create-Resource-Uuid': MOCKED_UUID,
          'Create-Version-Id': MOCKED_UUID,
        },
      });
    });

    it('propagates errors from NodeServiceApi', async () => {
      const errorMessage = 'API error';
      mockNodeServiceApi.createCheck.mockRejectedValueOnce(new Error(errorMessage));

      await expect(cellsAPI.uploadFile({filePath: TEST_FILE_PATH, file: testFile})).rejects.toThrow(errorMessage);
    });

    it('propagates errors from StorageService', async () => {
      mockNodeServiceApi.createCheck.mockResolvedValueOnce(
        createMockResponse({
          Results: [
            {
              Exists: false,
            },
          ],
        }),
      );

      const errorMessage = 'Storage error';
      mockStorageService.putObject.mockRejectedValueOnce(new Error(errorMessage));

      await expect(cellsAPI.uploadFile({filePath: TEST_FILE_PATH, file: testFile})).rejects.toThrow(errorMessage);
    });

    it('handles empty file path by using root path', async () => {
      mockNodeServiceApi.createCheck.mockResolvedValueOnce(
        createMockResponse({
          Results: [
            {
              Exists: false,
            },
          ],
        }),
      );

      await cellsAPI.uploadFile({filePath: '', file: testFile});

      expect(mockNodeServiceApi.createCheck).toHaveBeenCalledWith({
        Inputs: [{Type: 'LEAF', Locator: {Path: '/'}}],
        FindAvailablePath: true,
      });
    });
  });

  describe('getFile', () => {
    it('retrieves a file by ID', async () => {
      const fileId = 'file-uuid';
      const mockNode: Partial<RestNode> = {
        Path: `/${TEST_FILE_PATH}`,
        Uuid: fileId,
      };

      mockNodeServiceApi.getByUuid.mockResolvedValueOnce(createMockResponse(mockNode as RestNode));

      const result = await cellsAPI.getFile(fileId);

      expect(mockNodeServiceApi.getByUuid).toHaveBeenCalledWith(fileId);
      expect(result).toEqual(mockNode);
    });

    it('propagates errors when file retrieval fails', async () => {
      const fileId = 'file-uuid';
      const errorMessage = 'File not found';

      mockNodeServiceApi.getByUuid.mockRejectedValueOnce(new Error(errorMessage));

      await expect(cellsAPI.getFile(fileId)).rejects.toThrow(errorMessage);
    });

    it('handles empty ID', async () => {
      const emptyId = '';

      await expect(cellsAPI.getFile(emptyId)).rejects.toThrow();
    });
  });

  describe('getAllFiles', () => {
    it('retrieves all files with the correct parameters', async () => {
      const mockCollection: Partial<RestNodeCollection> = {
        // Use appropriate properties based on the actual RestNodeCollection interface
        Nodes: [
          {Path: '/file1.txt', Uuid: 'uuid1'},
          {Path: '/file2.txt', Uuid: 'uuid2'},
        ],
      };

      mockNodeServiceApi.lookup.mockResolvedValueOnce(createMockResponse(mockCollection as RestNodeCollection));

      const result = await cellsAPI.getAllFiles();

      expect(mockNodeServiceApi.lookup).toHaveBeenCalledWith({
        Locators: {Many: [{Path: '/*'}]},
        Flags: ['WithVersionsAll'],
      });
      expect(result).toEqual(mockCollection);
    });

    it('propagates errors when lookup fails', async () => {
      const errorMessage = 'Lookup failed';

      mockNodeServiceApi.lookup.mockRejectedValueOnce(new Error(errorMessage));

      await expect(cellsAPI.getAllFiles()).rejects.toThrow(errorMessage);
    });

    it('returns empty collection when no files exist', async () => {
      const emptyCollection: Partial<RestNodeCollection> = {
        Nodes: [],
      };

      mockNodeServiceApi.lookup.mockResolvedValueOnce(createMockResponse(emptyCollection as RestNodeCollection));

      const result = await cellsAPI.getAllFiles();
      expect(result).toEqual(emptyCollection);
    });
  });

  describe('deleteFile', () => {
    it('deletes a file with the correct path', async () => {
      const filePath = `/${TEST_FILE_PATH}`;

      mockNodeServiceApi.performAction.mockResolvedValueOnce(createMockResponse({}));

      await cellsAPI.deleteFile(filePath);

      expect(mockNodeServiceApi.performAction).toHaveBeenCalledWith('delete', {
        Nodes: [{Path: filePath}],
      });
    });

    it('propagates errors when deletion fails', async () => {
      const filePath = `/${TEST_FILE_PATH}`;
      const errorMessage = 'Delete failed';

      mockNodeServiceApi.performAction.mockRejectedValueOnce(new Error(errorMessage));

      await expect(cellsAPI.deleteFile(filePath)).rejects.toThrow(errorMessage);
    });

    it('handles attempts to delete non-existent paths', async () => {
      const nonExistentPath = '/does/not/exist.txt';
      const errorMessage = 'Path not found';

      mockNodeServiceApi.performAction.mockRejectedValueOnce(new Error(errorMessage));

      await expect(cellsAPI.deleteFile(nonExistentPath)).rejects.toThrow(errorMessage);
    });
  });
});

const TEST_FILE_NAME = 'test.txt';
const TEST_FILE_CONTENT = 'test content';
const TEST_FILE_TYPE = 'text/plain';
const TEST_FOLDER_PATH = 'folder';
const TEST_FILE_PATH = `${TEST_FOLDER_PATH}/${TEST_FILE_NAME}`;
const MOCKED_UUID = 'mocked-uuid';

function createMockResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {headers: {}} as any,
  } as AxiosResponse;
}

class MockFile {
  name: string;
  type: string;
  size: number;
  content: string;
  lastModified: number = Date.now();
  webkitRelativePath: string = '';

  constructor(content: string[], name: string, options?: {type: string}) {
    this.content = content.join('');
    this.name = name;
    this.type = options?.type || '';
    this.size = this.content.length;
  }

  arrayBuffer(): Promise<ArrayBuffer> {
    return Promise.resolve(new ArrayBuffer(0));
  }

  slice(): Blob {
    return new Blob();
  }

  stream(): ReadableStream {
    return new ReadableStream();
  }

  text(): Promise<string> {
    return Promise.resolve(this.content);
  }
}

const File = global.File || MockFile;
