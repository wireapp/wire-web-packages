export const unsafeAlphanumeric = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const range = Array.from(Array(length).keys());

  return range.reduce((acc, index) => acc + chars[Math.floor(Math.random() * chars.length)], '');
};
