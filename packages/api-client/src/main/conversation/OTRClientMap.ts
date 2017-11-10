interface OTRClientMap {
  [clientId: string]: string; // User ID → Encrypted Payload (Base64)
}

export default OTRClientMap;
