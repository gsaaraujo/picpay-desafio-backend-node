import { HttpResponse, HttpResponseError } from "@infra/http/responses/http-response";

export class InternalServerError extends HttpResponse {
  public constructor(error: HttpResponseError) {
    super("ERROR", 500, "INTERNAL_SERVER_ERROR", undefined, error);
  }
}
