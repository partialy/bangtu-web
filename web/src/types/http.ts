export interface Result<T> {
  code: number;
  message: string;
  data: T;
}

export class HttpError extends Error {
  readonly status: number;
  readonly code?: number;

  constructor(message: string, status: number, code?: number) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
  }
}
