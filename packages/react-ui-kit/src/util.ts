export const noop = () => {};

export const inlineSVG = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
