Steps to implement:

1. Fetch Json from /acme/acme/directory
2. Call WireE2eIdentity.directoryResponse() and pass the JSON from Step 1. Returns AcmeDirectory
3. Call the URL from AcmeDirectory.newNonce to get a Nonce
4. Call WireE2eIdentity.newAccountRequest() with previous received nonce and AcmeDirectory
