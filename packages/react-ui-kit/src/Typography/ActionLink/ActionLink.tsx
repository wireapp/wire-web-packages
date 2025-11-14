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

import * as React from 'react';
import {forwardRef} from 'react';

import {CSSObject} from '@emotion/react';

import {COLOR_V2} from '../../Identity/colors-v2/colors-v2';
import {Theme} from '../../Identity/Theme';
import {LinkProps, linkStyle, filterLinkProps} from '../Link';

type VisualProps = Pick<LinkProps, 'bold' | 'color' | 'fontSize' | 'textTransform'> & {
  disabled?: boolean;
  children: React.ReactNode;
};

type AnchorVariant = {
  href: string;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'onClick' | 'children' | 'disabled'>;

type ButtonVariant = {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;

export type ActionLinkProps = VisualProps & (AnchorVariant | ButtonVariant);

const resetButtonCss: CSSObject = {
  background: 'none',
  border: 'none',
  padding: 0,
  margin: 0,
};

const stateCss = (disabled?: boolean): CSSObject => {
  const base = {
    color: disabled ? COLOR_V2.GRAY_80 : COLOR_V2.BLACK,
    cursor: disabled ? 'default' : 'pointer',
    textDecoration: 'underline',
  } as const;

  if (disabled) {
    return base;
  }

  return {
    ...base,
    '&:hover': {
      color: COLOR_V2.BLUE,
      textDecorationThickness: '2px',
    },
    '&:focus-visible': {
      color: COLOR_V2.BLUE,
      background: 'rgba(255, 255, 255, 0.01)',
      borderRadius: 4,
      outline: '2px solid transparent',
      boxShadow: `0 0 0 2px ${COLOR_V2.BLUE_LIGHT_300}`,
    },
  };
};

export type LinkStyleProps<T = HTMLAnchorElement> = LinkProps<T>;

export const ActionLink = forwardRef<HTMLAnchorElement | HTMLButtonElement, ActionLinkProps>((props, ref) => {
  const {
    bold = false,
    color = COLOR_V2.BLACK,
    fontSize,
    textTransform = 'none',
    disabled,
    children,
    ...restProps
  } = props;

  const baseCss = (theme: Theme) =>
    ({
      ...linkStyle(theme, {
        bold,
        color,
        fontSize: fontSize ?? theme.fontSizes.base,
        textTransform,
      } as LinkProps),
      ...stateCss(disabled),
    }) satisfies CSSObject;

  if ('href' in restProps && restProps.href) {
    const {href, target, ...anchorProps} = restProps;
    const linkProps = filterLinkProps(anchorProps as unknown as LinkProps);

    const handleAnchorClick: React.MouseEventHandler<HTMLAnchorElement> = e => {
      if (disabled) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      onClick?.(e as any);
    };

    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        css={(theme: Theme) => baseCss(theme)}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
        onClick={handleAnchorClick}
        {...linkProps}
      >
        {children}
      </a>
    );
  }

  const {onClick, ...btnProps} = props as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type="button"
      disabled={disabled || btnProps.disabled}
      onClick={onClick}
      css={(theme: Theme) => [resetButtonCss, baseCss(theme)]}
      {...btnProps}
    >
      {children}
    </button>
  );
});

ActionLink.displayName = 'ActionLink';
