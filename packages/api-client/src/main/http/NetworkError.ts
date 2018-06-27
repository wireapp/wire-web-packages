class NetworkError extends Error {
  constructor(public message: string) {
    super(message);
    Object.setPrototypeOf(this, NetworkError.prototype);
    this.message = `@wireapp/api-client/http/NetworkError: ${message}`;
    this.name = this.constructor.name;
    this.stack = new Error().stack;
  }
}

export {NetworkError};
