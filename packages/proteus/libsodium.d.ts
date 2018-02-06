declare module 'libsodium-wrappers-sumo' {
  type OutputFormat = 'uint8array' | 'text' | 'hex' | 'base64';

  const crypto_auth_hmacsha256_KEYBYTES: number;

  interface KeyPair {
    publicKey: string | Uint8Array;
    privateKey: string | Uint8Array;
    keyType: 'ed25519';
  }

  function memzero(bytes: Uint8Array): void;
  function from_string(str: string): Uint8Array;
  function to_hex(bytes: Uint8Array): string;
  function to_base64(aBytes: Uint8Array, noNewLine?: boolean): string;
  function crypto_auth_hmacsha256(
    message: string | Uint8Array,
    key: Uint8Array,
    outputFormat?: OutputFormat
  ): string | Uint8Array;
  function crypto_auth_hmacsha256_verify(
    tag: string | Uint8Array,
    message: string | Uint8Array,
    key: string | Uint8Array
  ): boolean;
  function crypto_hash_sha256(message: string | Uint8Array, outputFormat?: OutputFormat): string | Uint8Array;
  function crypto_scalarmult(
    privateKey: Uint8Array,
    publicKey: Uint8Array,
    outputFormat?: OutputFormat
  ): string | Uint8Array;
  function crypto_sign_detached(
    message: string | Uint8Array,
    privateKey: Uint8Array,
    outputFormat?: OutputFormat
  ): string | Uint8Array;
  function crypto_sign_keypair(outputFormat?: OutputFormat): KeyPair;
  function crypto_sign_verify_detached(
    signature: Uint8Array,
    message: string | Uint8Array,
    publicKey: Uint8Array
  ): boolean;
  function crypto_stream_chacha20_xor(
    input_message: string | Uint8Array,
    nonce: Uint8Array,
    key: Uint8Array,
    outputFormat?: OutputFormat
  ): string | Uint8Array;
}
