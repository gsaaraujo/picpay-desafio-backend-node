import { HttpResponse, HttpResponseError } from "@infra/http/responses/http-response";

export class NotFound extends HttpResponse {
  public constructor(error: HttpResponseError) {
    super("ERROR", 404, "NOT_FOUND", undefined, error);
  }
}
