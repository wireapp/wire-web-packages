export interface Crypto {
  digest(algo: string, cipherText: Buffer | Uint8Array): Promise<Buffer>;

  decrypt(cipherText: Buffer | Uint8Array, keyBytes: Buffer): Promise<Buffer>;

  getRandomValues(size: number): Buffer;

  encrypt(
    plainText: Buffer | Uint8Array,
    keyBytes: Buffer,
    initializationVector: Buffer,
    algorithm: string,
  ): Promise<{key: Buffer; cipher: Buffer}>;
}
