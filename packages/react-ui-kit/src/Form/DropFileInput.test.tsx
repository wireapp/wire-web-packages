/*
 * Wire
 * Copyright (C) 2022 Wire Swiss GmbH
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

import React from 'react';
import {matchComponent} from '../test/testUtil';
import {DropFileInput, DropFileInputProps} from './DropFileInput';
import {fireEvent, render} from '@testing-library/react';
import {StyledApp, THEME_ID} from '../Layout';

//note: we don't have to test file type validation using native file upload,
// it won't allow to pick different type thant expected

const getDefaultProps = () => ({
  onInvalidFilesDropError: jest.fn(),
  onFilesUploaded: jest.fn(),
  headingText: 'Drag & Drop an image \nor',
  labelText: 'select one from your device',
  accept: 'image/png, image/jpeg',
  description: 'Image (JPG/PNG) size up to 1 MB, minimum 200 x 600 px',
});

const ThemedDropFileInput = (props: DropFileInputProps) => (
  <StyledApp themeId={THEME_ID.LIGHT}>
    <DropFileInput {...props} />
  </StyledApp>
);

describe('"DropFileInput"', () => {
  it('matches snapshot', () => matchComponent(<ThemedDropFileInput {...getDefaultProps()} />));

  it('returns file on native file upload', () => {
    const file = new File(['(⌐□_□)'], 'chucknorris.png', {type: 'image/png'});

    const props = {
      ...getDefaultProps(),
      accept: undefined,
    };

    const {getByTestId} = render(<ThemedDropFileInput {...props} />);

    const fileInput = getByTestId('file-input');

    // i have to do this because `input.files =[file]` is not allowed
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });
    fireEvent.change(fileInput);

    expect(props.onFilesUploaded).toHaveBeenCalledWith([file]);
  });

  it('allows to upload different types of files when "accept" attribute not specified', () => {
    const file = new File(['(⌐□_□)'], 'chucknorris.png', {type: 'image/png'});
    const file2 = new File(['(⌐□_□)'], 'chucknorris.xlsx', {type: '.xlsx'});

    const props = {
      ...getDefaultProps(),
      accept: undefined,
    };

    const {getByTestId} = render(<ThemedDropFileInput {...props} />);

    const dropZone = getByTestId('dropzone');
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file],
      },
    });

    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file2],
      },
    });

    expect(props.onFilesUploaded).toHaveBeenCalledTimes(2);
  });

  it('allows to upload only file types specified in "accept" attribute', () => {
    const file = new File(['(⌐□_□)'], 'chucknorris.png', {type: 'image/png'});
    const file2 = new File(['(⌐□_□)'], 'chucknorris.jpg', {type: 'image/jpeg'});

    const props = {
      ...getDefaultProps(),
      accept: 'image/png',
      onInvalidFilesDropError: jest.fn(),
      onFilesUploaded: jest.fn(),
    };

    const {getByTestId} = render(<ThemedDropFileInput {...props} />);

    const dropZone = getByTestId('dropzone');
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file],
      },
    });

    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file2],
      },
    });

    expect(props.onFilesUploaded).toHaveBeenCalledTimes(1);
    expect(props.onInvalidFilesDropError).toHaveBeenCalled();
  });

  it('returns first file when "multiple" attribute not specified', () => {
    const file = new File(['(⌐□_□)'], 'chucknorris.png', {type: 'image/png'});
    const file2 = new File(['(⌐□_□)'], 'chucknorris.png', {type: 'image/png'});

    const props = {
      ...getDefaultProps(),
      accept: 'image/png',
      onInvalidFilesDropError: jest.fn(),
      onFilesUploaded: jest.fn(),
    };

    const {getByTestId} = render(<ThemedDropFileInput {...props} />);

    const dropZone = getByTestId('dropzone');
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file, file2],
      },
    });

    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file2],
      },
    });

    expect(props.onFilesUploaded).toHaveBeenCalledWith([file]);
  });

  it('returns all files when "multiple" attribute specified', () => {
    const file = new File(['(⌐□_□)'], 'chucknorris.png', {type: 'image/png'});
    const file2 = new File(['(⌐□_□)'], 'chucknorris.png', {type: 'image/png'});

    const props = {
      ...getDefaultProps(),
      accept: 'image/png',
      onInvalidFilesDropError: jest.fn(),
      onFilesUploaded: jest.fn(),
      multiple: true,
    };

    const {getByTestId} = render(<ThemedDropFileInput {...props} />);

    const dropZone = getByTestId('dropzone');
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file, file2],
      },
    });

    expect(props.onFilesUploaded).toHaveBeenCalledWith([file, file2]);
  });
});
