export default class StatusCode {
  public static readonly ACCEPTED: number = 202;
  public static readonly BAD_GATEWAY: number = 502;
  public static readonly BAD_REQUEST: number = 400;
  public static readonly CONFLICT: number = 409;
  public static readonly CONNECTIVITY_PROBLEM: number = 0;
  public static readonly CREATED: number = 201;
  public static readonly FORBIDDEN: number = 403;
  public static readonly INTERNAL_SERVER_ERROR: number = 500;
  public static readonly NO_CONTENT: number = 204;
  public static readonly NOT_FOUND: number = 404;
  public static readonly OK: number = 200;
  public static readonly PRECONDITION_FAILED: number = 412;
  public static readonly REQUEST_TIMEOUT: number = 408;
  public static readonly REQUEST_TOO_LARGE: number = 413;
  public static readonly TOO_MANY_REQUESTS: number = 429;
  public static readonly UNAUTHORIZED: number = 401;
}
