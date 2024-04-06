type Status = "ERROR" | "SUCCESS";

export type HttpResponseError = {
  readonly message: string;
  readonly suggestion?: string;
  readonly path: string;
  readonly timestamp: string;
};

export class HttpResponse {
  public status: Status;
  public statusCode: number;
  public statusText: string;
  public error?: HttpResponseError;
  public data?: unknown;

  public constructor(
    status: Status,
    statusCode: number,
    statusText: string,
    data?: unknown,
    error?: HttpResponseError,
  ) {
    this.status = status;
    this.statusCode = statusCode;
    this.statusText = statusText;
    this.data = data;
    this.error = error;
  }
}
