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

import {useState, forwardRef, DragEvent} from 'react';
import * as React from 'react';

import {CSSObject} from '@emotion/react';

import {UploadIcon} from '../Icon';
import {COLOR} from '../Identity';
import {Theme, FlexBox} from '../Layout';
import {TextProps} from '../Text';

export interface DropFileInputProps<T = HTMLInputElement> extends TextProps<T> {
  onFilesUploaded: (files: File[]) => void;
  onInvalidFilesDropError: () => void;
  labelText: string;
  headingText: string;
  description?: string;
  dropFileZoneWrapperCSS?: CSSObject;
}

const visuallyHiddenStyles: CSSObject = {
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: '1px',
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: '1px',
};

export const dropFileWrapperStyle: CSSObject = {
  maxWidth: '330px',
};

export const dropFileZoneWrapperStyle: (theme: Theme, isDraggedOver: boolean) => CSSObject = (
  theme,
  isDraggedOver,
) => ({
  width: '100%',
  padding: '28px 12px',
  border: `1px dashed ${theme.general.primaryColor}`,
  borderBottomWidth: '2px',
  borderRadius: '6px',
  textAlign: 'center',
  backgroundColor: isDraggedOver ? theme.general.backgroundColor : COLOR.WHITE,
  fontWeight: 400,
  fontSize: '0.75rem',
  lineHeight: '13px',
  color: COLOR.GRAY,
});

export const dropFileZoneLabelStyle: (theme: Theme) => CSSObject = theme => ({
  color: theme.general.primaryColor,
  cursor: 'pointer',
  ':focus-within': {
    outline: `1px solid ${theme.general.primaryColor}`,
  },
  ':hover': {
    textDecoration: 'underline',
  },
});

export const dropFileZoneHeadingStyle: CSSObject = {
  display: 'block',
  whiteSpace: 'pre-line',
};

export const dropFileZonDescriptionStyle: CSSObject = {
  marginTop: '12px',
  fontWeight: 400,
  fontSize: '0.625rem',
  lineHeight: '0.8125rem',
  color: COLOR.GRAY,
  whiteSpace: 'pre-line',
};

export const DropFileInput = forwardRef<HTMLInputElement, DropFileInputProps<HTMLInputElement>>(
  (
    {
      onFilesUploaded,
      onInvalidFilesDropError,
      dropFileZoneWrapperCSS,
      labelText,
      headingText,
      description,
      accept,
      multiple,
      ...inputProps
    },
    ref,
  ) => {
    const [isDraggedOver, setIsDraggedOver] = useState(false);

    const resetDraggedOver = () => setIsDraggedOver(false);

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = 'copy';

      if (event.dataTransfer.items.length > 0) {
        setIsDraggedOver(true);
      }
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      resetDraggedOver();

      const {files} = event.dataTransfer;
      if (files.length < 1) {
        return;
      }

      const filesArr = multiple ? Array.from(files) : [files[0]];

      const areFilesValid = !!accept
        ? filesArr.every(file =>
            accept
              .split(',')
              .map(v => v.trim())
              .includes(file.type),
          )
        : true;

      if (!areFilesValid) {
        onInvalidFilesDropError();
        return;
      }

      onFilesUploaded(filesArr);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const {files} = event.target;

      if (files.length < 1) {
        return;
      }

      onFilesUploaded(Array.from(files));
    };

    return (
      <div css={dropFileWrapperStyle}>
        <div
          css={(theme: Theme) => ({
            ...dropFileZoneWrapperStyle(theme, isDraggedOver),
            ...dropFileZoneWrapperCSS,
          })}
          data-testid="dropzone"
          onDragOver={handleDragOver}
          onDragLeave={resetDraggedOver}
          onDrop={handleDrop}
        >
          <FlexBox align="center" justify="center" flexWrap="wrap" css={{maxWidth: '280px', margin: '0 auto'}}>
            <UploadIcon css={{margin: '12px 0'}} />
            <div css={{maxWidth: '160px', margin: '0 25px'}}>
              <span css={dropFileZoneHeadingStyle}>{headingText}</span>
              <label
                aria-label={`${headingText} ${labelText} (${description})`}
                css={(theme: Theme) => dropFileZoneLabelStyle(theme)}
              >
                <span>{labelText}</span>
                <input
                  data-testid="file-input"
                  ref={ref}
                  accept={accept}
                  multiple={multiple}
                  css={visuallyHiddenStyles}
                  onChange={handleChange}
                  type="file"
                  {...inputProps}
                />
              </label>
            </div>
          </FlexBox>
        </div>
        {description && <p css={dropFileZonDescriptionStyle}>{description}</p>}
      </div>
    );
  },
);
DropFileInput.displayName = 'DropFileInput';
