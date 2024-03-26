import {Theme} from '../Theme/Theme';
import {CSSObject} from '@emotion/react';
import {COLOR, COLOR_V2} from '../Identity';
import {textStyle} from '../Text';
import {defaultTransition} from '../Identity/motions';
import {ButtonProps, ButtonVariant} from './Button';

const buttonPrimaryStyles = <T>(theme: Theme, {backgroundColor, disabled, isActive}: ButtonProps<T>) => {
  const activeStyles = {
    backgroundColor: theme.Button.primaryActiveBg,
    border: `1px solid ${theme.Button.primaryActiveBorder}`,
    color: COLOR.WHITE,
  };

  return {
    ...(isActive
      ? activeStyles
      : {
          color: disabled ? theme.Button.primaryDisabledText : theme.general.contrastColor,
          backgroundColor: backgroundColor || disabled ? theme.Button.primaryDisabledBg : theme.Button.primaryBg,
        }),

    ...(!disabled && {
      '&:hover, &:focus': {
        backgroundColor: theme.Button.primaryHoverBg,
      },
      '&:focus': {
        border: `1px solid ${theme.Button.primaryFocusBorder}`,
      },
      '&:active': activeStyles,
    }),
  };
};

const buttonSecondaryStyles = <T>(theme: Theme, {backgroundColor, disabled, isActive}: ButtonProps<T>) => {
  const activeStyles = {
    backgroundColor: theme.Button.secondaryActiveBg,
    border: `1px solid ${theme.Button.secondaryActiveBorder}`,
    color: theme.general.primaryColor,
  };

  console.log('[Button.styles.ts] przemvs isActive', isActive);

  return {
    border: `1px solid ${theme.IconButton.primaryBorderColor}`,

    ...(isActive
      ? activeStyles
      : {
          color: disabled ? theme.Input.placeholderColor : theme.general.color,
          backgroundColor:
            backgroundColor || disabled ? theme.IconButton.primaryDisabledBgColor : theme.IconButton.primaryBgColor,
        }),

    ...(!disabled && {
      '&:hover, &:focus': {
        border: `1px solid ${theme.Button.secondaryHoverBorder}`,
      },
      '&:focus': {
        color: theme.IconButton.primaryActiveFillColor,
      },
      '&:active': activeStyles,
    }),
  };
};

const buttonTertiaryStyles = <T>(theme: Theme, {backgroundColor, disabled, isActive}: ButtonProps<T>) => {
  const activeStyles = {
    backgroundColor: theme.Button.tertiaryActiveBg,
    color: theme.IconButton.primaryActiveFillColor,
    '& > svg > path': {
      fill: theme.IconButton.primaryActiveFillColor,
    },
  };

  return {
    border: disabled ? `1px solid ${theme.Button.tertiaryDisabledBorder}` : `1px solid ${theme.Button.tertiaryBorder}`,
    borderRadius: '12px',
    fontSize: theme.fontSizes.medium,
    fontWeight: 700,
    lineHeight: '1.5rem',
    padding: '4px 8px',
    '& > svg > path': {
      fill: disabled ? theme.Input.placeholderColor : theme.general.color,
    },

    ...(isActive
      ? activeStyles
      : {
          color: disabled ? theme.Input.placeholderColor : theme.general.color,
          backgroundColor: backgroundColor || disabled ? theme.Button.tertiarydisabledBg : theme.Button.tertiaryBg,
        }),

    ...(!disabled && {
      '&:hover, &:focus': {
        backgroundColor: theme.Button.tertiaryHoverBg,
        border: `1px solid ${theme.Button.tertiaryHoverBorder}`,
      },
      '&:focus': {
        border: `1px solid ${theme.general.focusColor}`,
      },
      '&:active': activeStyles,
    }),
  };
};

const buttonQuaternaryStyles = <T>({backgroundColor, disabled, isActive}: ButtonProps<T>) => {
  const activeStyles = {
    backgroundColor: COLOR_V2.GREEN_LIGHT_700,
  };

  return {
    lineHeight: '1.5rem',

    ...(isActive
      ? activeStyles
      : {
          color: disabled ? COLOR_V2.GRAY_80 : COLOR_V2.WHITE,
          backgroundColor: backgroundColor || disabled ? COLOR_V2.GRAY_50 : COLOR_V2.GREEN,
        }),

    ...(!disabled && {
      '&:hover, &:focus': {
        backgroundColor: COLOR_V2.GREEN_LIGHT_600,
      },
      '&:focus': {
        border: `1px solid ${COLOR_V2.GREEN_LIGHT_700}`,
      },
      '&:active': activeStyles,
    }),
  };
};

const buttonCancelStyles = <T>({backgroundColor, disabled, isActive}: ButtonProps<T>) => {
  const activeStyles = {
    backgroundColor: COLOR_V2.RED_LIGHT_700,
  };

  return {
    lineHeight: '1.5rem',

    ...(isActive
      ? activeStyles
      : {
          color: disabled ? COLOR_V2.GRAY_80 : COLOR_V2.WHITE,
          backgroundColor: backgroundColor || disabled ? COLOR_V2.GRAY_50 : COLOR_V2.RED,
        }),

    ...(!disabled && {
      '&:hover, &:focus': {
        backgroundColor: COLOR_V2.RED_LIGHT_600,
      },
      '&:focus': {
        border: `1px solid ${COLOR_V2.RED_LIGHT_700}`,
      },
      '&:active': activeStyles,
    }),
  };
};

const buttonSendStyles = <T>({backgroundColor, disabled, isActive}: ButtonProps<T>) => {
  const activeStyles = {
    backgroundColor: COLOR_V2.BLUE_LIGHT_700,
  };

  return {
    width: '40px',

    ...(isActive
      ? activeStyles
      : {
          backgroundColor: backgroundColor || disabled ? COLOR_V2.GRAY_70 : COLOR_V2.BLUE,
        }),

    ...(!disabled && {
      '&:hover, &:focus': {
        backgroundColor: COLOR_V2.BLUE_LIGHT_600,
      },
      '&:focus': {
        border: `1px solid ${COLOR_V2.BLUE_LIGHT_800}`,
      },
      '&:active': activeStyles,
    }),
  };
};

export const buttonStyle: <T>(theme: Theme, props: ButtonProps<T>) => CSSObject = (
  theme,
  {
    variant = ButtonVariant.PRIMARY,
    backgroundColor,
    block = false,
    disabled = false,
    noCapital = false,
    bold = true,
    center = true,
    color = COLOR.WHITE,
    fontSize = theme.fontSizes.base,
    noWrap = true,
    textTransform = 'none',
    truncate = true,
    ...props
  },
) => {
  return {
    ...textStyle(theme, {
      block,
      bold,
      center,
      disabled,
      fontSize,
      noWrap,
      textTransform,
      truncate,
      ...props,
    }),
    border: 0,
    cursor: disabled ? 'default' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
    padding: 0,
    outline: 'none',
    textDecoration: 'none',
    touchAction: 'manipulation',
    transition: defaultTransition,
    width: block ? '100%' : 'auto',
    '&:hover, &:focus': {
      textDecoration: 'none',
    },

    ...(variant !== ButtonVariant.TERTIARY && {
      borderRadius: variant === ButtonVariant.SEND ? '100%' : '16px',
      height: variant === ButtonVariant.SEND ? '40px' : '48px',
      lineHeight: variant === ButtonVariant.SEND ? '40px' : '48px',
      ...(variant !== ButtonVariant.SEND && {
        maxWidth: '100%',
        minWidth: '125px',
        padding: '0 16px',
      }),
    }),

    ...(variant === ButtonVariant.PRIMARY && buttonPrimaryStyles(theme, props)),
    ...(variant === ButtonVariant.SECONDARY && buttonSecondaryStyles(theme, props)),
    ...(variant === ButtonVariant.TERTIARY && buttonTertiaryStyles(theme, props)),
    ...(variant === ButtonVariant.QUATERNARY && buttonQuaternaryStyles(props)),
    ...(variant === ButtonVariant.CANCEL && buttonCancelStyles(props)),
    ...(variant === ButtonVariant.SEND && buttonSendStyles(props)),
  };
};
