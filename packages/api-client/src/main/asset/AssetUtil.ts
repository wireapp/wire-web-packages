export const isValidKey = (key: string): boolean => /^[A-Za-z0-9-]+$/.test(key);

export const isValidToken = (token: string): boolean => /^[A-Za-z0-9+/=\-]+$/.test(token);
