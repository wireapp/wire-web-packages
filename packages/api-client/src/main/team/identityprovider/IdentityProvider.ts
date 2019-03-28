interface IdentityProvider {
  id: string;
  metadata: IdentityProviderMetaData;
  extraInfo: string;
}

interface IdentityProviderMetaData {
  issuer: string;
  requestURI: string;
  certAuthnResponse: string[];
}

export {IdentityProvider, IdentityProviderMetaData};
