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

/** @jsx jsx */
import {CSSObject, jsx} from '@emotion/react';
import React, {useState} from 'react';

import {COLOR} from '../Identity';
import type {Theme} from '../Layout';
import type {TextProps} from '../Text';
import {UploadIcon} from '../Icon';
import {FlexBox} from '../Layout';

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

export const dropFileZoneWrapperStyle: <T>(theme: Theme, isDraggedOver: boolean) => CSSObject = (
  theme,
  isDraggedOver,
) => {
  return {
    width: '100%',
    padding: '28px',
    border: `1px dashed ${theme.general.primaryColor}`,
    borderBottomWidth: '2px',
    borderRadius: '6px',
    textAlign: 'center',
    backgroundColor: isDraggedOver ? theme.general.backgroundColor : COLOR.WHITE,
    fontWeight: 400,
    fontSize: '12px',
    lineHeight: '13px',
    color: COLOR.GRAY,
  };
};

export const dropFileZoneLabelStyle: <T>(theme: Theme) => CSSObject = theme => {
  return {
    color: theme.general.primaryColor,
    cursor: 'pointer',
    ':focus-within': {
      outline: `1px solid ${theme.general.primaryColor}`,
    },
    ':hover': {
      textDecoration: 'underline',
    },
  };
};

export const dropFileZoneHeadingStyle: CSSObject = {
  display: 'block',
  whiteSpace: 'pre-line',
};

export const dropFileZonDescriptionStyle: CSSObject = {
  marginTop: '12px',
  fontWeight: 400,
  fontSize: '10px',
  lineHeight: '13px',
  color: COLOR.GRAY,
  whiteSpace: 'pre-line',
};

export const DropFileInput: React.FC<DropFileInputProps<HTMLInputElement>> = React.forwardRef<
  HTMLInputElement,
  DropFileInputProps<HTMLInputElement>
>((props, ref) => {
  const {
    onFilesUploaded,
    onInvalidFilesDropError,
    dropFileZoneWrapperCSS,
    labelText,
    headingText,
    description,
    accept,
    multiple,
    ...inputProps
  } = props;

  const [isDraggedOver, setIsDraggedOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';

    if (e.dataTransfer.items.length > 0) {
      setIsDraggedOver(true);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggedOver(false);

    const {files} = e.dataTransfer;
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {files} = e.target;
    if (files.length < 1) {
      return;
    }
    onFilesUploaded(Array.from(files));
  };

  return (
    <div css={dropFileWrapperStyle}>
      <div
        css={{...(theme: Theme) => dropFileZoneWrapperStyle(theme, isDraggedOver), ...dropFileZoneWrapperCSS}}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDraggedOver(false)}
        onDrop={handleDrop}
      >
        <FlexBox align="center" justify="center" css={{position: 'relative'}}>
          <UploadIcon css={{position: 'absolute', left: '15px'}} />
          <div css={{maxWidth: '160px'}}>
            <span css={dropFileZoneHeadingStyle}>{headingText}</span>
            <label
              aria-label={`${headingText} ${labelText} (${description})`}
              css={(theme: Theme) => dropFileZoneLabelStyle(theme)}
            >
              <span>{labelText}</span>
              <input
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
});
