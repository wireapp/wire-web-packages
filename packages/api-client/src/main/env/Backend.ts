export default class Backend {
  public static PRODUCTION: {rest: string; ws: string; name?: string} = {
    name: 'prod',
    rest: 'https://prod-nginz-https.wire.com',
    ws: 'wss://prod-nginz-ssl.wire.com',
  };

  public static STAGING: {rest: string; ws: string; name?: string} = {
    name: 'staging',
    rest: 'https://staging-nginz-https.zinfra.io',
    ws: 'wss://staging-nginz-ssl.zinfra.io',
  };
}
