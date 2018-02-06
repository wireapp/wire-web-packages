declare module 'ed2curve' {
  type publicKeyEd25519 = Uint8Array;
  type secretKeyEd25519 = Uint8Array;
  type publicKeyCurve25519 = Uint8Array;
  type secretKeyCurve25519 = Uint8Array;

  interface KeyPairEd25519 {
    publicKey: publicKeyEd25519;
    secretKey: secretKeyEd25519;
  }

  interface KeyPairCurve25519 {
    publicKey: publicKeyCurve25519;
    secretKey: secretKeyCurve25519;
  }

  /**
   * Converts Ed25519 public key to Curve25519 public key.
   * montgomeryX = (edwardsY + 1)*inverse(1 - edwardsY) mod p
   */
  function convertPublicKey(publicKey: publicKeyEd25519): publicKeyCurve25519;

  /** Converts Ed25519 secret key to Curve25519 secret key. */
  function convertSecretKey(secretKey: secretKeyEd25519): secretKeyCurve25519;

  /** Converts Ed25519 key pair to Curve25519 key pair. */
  function convertKeyPair(keyPair: KeyPairEd25519): KeyPairCurve25519;
}
